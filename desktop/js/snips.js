INTENT = null;
INTENT_ID = null;
CMDS = null;
MASTER_DEVICES = null;
(function (original) {
  jQuery.fn.clone = function () {
    var result           = original.apply(this, arguments),
        my_textareas     = this.find('textarea').add(this.filter('textarea')),
        result_textareas = result.find('textarea').add(result.filter('textarea')),
        my_selects       = this.find('select').add(this.filter('select')),
        result_selects   = result.find('select').add(result.filter('select'));
    for (var i = 0, l = my_textareas.length; i < l; ++i) $(result_textareas[i]).val($(my_textareas[i]).val());
    for (var i = 0, l = my_selects.length;   i < l; ++i) {
      for (var j = 0, m = my_selects[i].options.length; j < m; ++j) {
        if (my_selects[i].options[j].selected === true) {
          result_selects[i].options[j].selected = true;
        }
      }
    }
    return result;
  };
}) (jQuery.fn.clone);

$(function () {
    if ($('input[name=reaction]').is(":checked")) {
        $(this).closest('label').addClass('active');
    } else {
        $(this).closest('label').removeClass('active');
    }

    if ($('#isEnable').is(":checked")) {
        $(this).closest('label').addClass('active');
        $(this).closest('label').removeClass('btn-success');
        $(this).closest('label').addClass('btn-danger');
        $(this).closest('label').find('span').text('{{× Disable}}');
    } else {
        $(this).closest('label').removeClass('active');
        $(this).closest('label').removeClass('btn-danger');
        $(this).closest('label').addClass('btn-success');
        $(this).closest('label').find('span').text('{{Enable}}');
    }
})

$(document).on('change', '#intentName', function () {
    INTENT = $('#intentName').val();
    INTENT_ID = $('#intentId').val();
    $('a[href="#intenttab"]').html('<i class="fas fa-brain"></i> ' + $('#intentName').val())

    jeedom.eqLogic.getCmd({
        id: $('#intentId').val(),
        async: false,
        success: function (cmds) {
            CMDS = cmds;
        }
    });

    $.ajax({
        type: "POST",
        url: "plugins/snips/core/ajax/snips.ajax.php",
        data: {
            action: "getMasterDevices",
        },
        dataType: 'json',
        global: false,
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            MASTER_DEVICES = data.result;
        }
    });
});

$(document).on('change', 'input[name=reaction]', function () {
    if ($(this).is(":checked")) {
        $(this).closest('label').addClass('active');
    } else {
        $(this).closest('label').removeClass('active');
    }
});

$(document).on('change', '#isEnable', function () {
    if ($(this).is(":checked")) {
        $(this).closest('label').addClass('active');
        $(this).closest('label').removeClass('btn-success');
        $(this).closest('label').addClass('btn-danger');
        $(this).closest('label').find('span').text('{{× Disable}}');
    } else {
        $(this).closest('label').removeClass('active');
        $(this).closest('label').removeClass('btn-danger');
        $(this).closest('label').addClass('btn-success');
        $(this).closest('label').find('span').text('{{Enable}}');
    }
});

$(document).on('click', '.testSite', function () {
    var site = $(this).data('site');
    $.ajax({
        type: "POST",
        url: "plugins/snips/core/ajax/snips.ajax.php",
        data: {
            action: "findSnipsDevice",
            siteId: site
        },
        dataType: 'json',
        global: false,
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            $('#div_alert').showAlert({
                message: '{{Test sound is sent!}}',
                level: 'success'
            });
        }
    });
});

$(document).on('change', '#table_mod_insertCmdValue_valueEqLogicToMessage .mod_insertCmdValue_object select', function () {
    if ($(this).find("option:selected").text() == 'Snips-Intents') {
        $('#table_mod_insertCmdValue_valueEqLogicToMessage').find('thead').html(
            '<tr>' +
            '<th style="width: 150px;">Object</th>' +
            '<th style="width: 150px;">Intents</th>' +
            '<th style="width: 150px;">Slots</th>' +
            '</tr>'
        );
    } else {
        $('#table_mod_insertCmdValue_valueEqLogicToMessage').find('thead').html(
            '<tr>' +
            '<th style="width: 150px;">Object</th>' +
            '<th style="width: 150px;">Device</th>' +
            '<th style="width: 150px;">Command</th>' +
            '</tr>'
        );
    }
});

$('#bt_addNewBinding').off('click').on('click', function () {
    bootbox.prompt("{{Please give a name}}", function (result) {
        if (result !== null && result != '') {
            addBinding({
                name: result
            });
        }
    });
});

$('body').off('click', '.rename').on('click', '.rename', function () {
    var el = $(this);
    bootbox.prompt("{{New name?}}", function (result) {
        if (result !== null && result != '') {
            var previousName = el.text();
            el.text(result);
            el.closest('.panel.panel-default').find('span.name').text(result);
        }
    });
});

$("body").off('click', '.listCmdAction').on('click', '.listCmdAction', function () {
    var el = $(this);
    jeedom.cmd.getSelectModal({
        cmd: {
            type: 'action'
        }
    }, function (result) {
        var input = el.closest('.action').find('.expressionAttr[data-l1key=cmd]');
        input.value(result.human);
        el.closest('.action').find('.slotsOptions').empty();
        jeedom.cmd.displayActionOption(input.value(), '', function (html) {
            var is_slider = html.indexOf('expressionAttr[data-l1key=options][data-l2key=slider]');
            if (is_slider > 0) {
                html = html.replace(
                    'jeedom.cmd.getSelectModal',
                    'var el = $(this);jeedom.cmd.getSelectModal');

                html = html.replace(
                    '.atCaret(\'insert\', result.human);',
                    '.atCaret(\'insert\', result.human);$.ajax({type:"POST",url:"plugins/snips/core/ajax/snips.ajax.php",data:{action:"getSnipsType",cmd:result.cmd.id,},dataType:"json",global:false,error:function(request,status,error){handleAjaxError(request,status,error)},success:function(data){if(data.result=="snips/percentage"){el.closest(".action").find(".slotsOptions").empty();displayValueMap(el.closest(".action").find(".slotsOptions"))}else{el.closest(".action").find(".slotsOptions").empty()}}});'
                    );
            }
            input.closest('.action').find('.actionOptions').html(html);
        });
    });
});

$("body").off('click', '.listAction').on('click', '.listAction', function () {
    var el = $(this);
    jeedom.getSelectActionModal({}, function (result) {
        var input = el.closest('.action').find('.expressionAttr[data-l1key=cmd]');
        input.value(result.human);
        el.closest('.action').find('.slotsOptions').empty();
        jeedom.cmd.displayActionOption(input.value(), '', function (html) {
            input.closest('.action').find('.actionOptions').html(html);
        });
    });
});

$("body").off('click', '.listCmdPlayer').on('click', '.listCmdPlayer', function () {
    var el = $(this);
    jeedom.cmd.getSelectModal({
        cmd: { type: 'action'}
    }, function (result) {
        var input = el.closest('.binding').find('input[data-l1key=ttsPlayer]');
        input.value(result.human);
    });
});

$("body").delegate(".listInfoCmd", 'click', function () {
    var el = $(this);
    jeedom.cmd.getSelectModal({
        cmd: {
            type: 'info'
        }
    }, function (result) {
        var input = el.closest('.infoCmd').find('.ttsVarAttr[data-l1key=cmd]');
        input.value(result.human);
        if (result.cmd.subType == 'binary') {
            el.closest('.varCmd').find('.infoOptions').empty();
            displayBinaryMap(el.closest('.varCmd').find('.infoOptions'), result.human);
        } else {
            el.closest('.varCmd').find('.infoOptions').empty();
        }
    });
});

$("body").off('click', '.bt_removeAction').on('click', '.bt_removeAction', function () {
    var type = $(this).attr('data-type');
    $(this).closest('.' + type).remove();
});

$("body").off('click', '.bt_removeCondition').on('click', '.bt_removeCondition', function () {
    var type = $(this).attr('data-type');
    $(this).closest('.' + type).remove();
});

$("#div_bindings").off('click', '.bt_addCondition').on('click', '.bt_addCondition', function () {
    addCondition({}, $(this).closest('.binding'));
});

$("#div_bindings").off('click', '.bt_addAction').on('click', '.bt_addAction', function () {
    addAction({}, $(this).closest('.binding'));
});

$('body').off('focusout', '.cmdAction.expressionAttr[data-l1key=cmd]').on('focusout', '.cmdAction.expressionAttr[data-l1key=cmd]', function (event) {
    var type = $(this).attr('data-type')
    var expression = $(this).closest('.' + type).getValues('.expressionAttr');
    var el = $(this);
    jeedom.cmd.displayActionOption($(this).value(), init(expression[0].options), function (html) {
        el.closest('.' + type).find('.actionOptions').html(html);
        taAutosize();
    })
});

$("#div_bindings").off('click', '.bt_removeBinding').on('click', '.bt_removeBinding', function () {
    $(this).closest('.binding').remove();
});

$('#div_bindings').off('click', '.bt_duplicateBinding').on('click', '.bt_duplicateBinding', function () {
    var binding = $(this).closest('.binding').clone();
    bootbox.prompt("{{Please give a name to this new binding}}", function (result) {
        if (result !== null) {
            var random = Math.floor((Math.random() * 1000000) + 1);
            binding.find('a[data-toggle=collapse]').attr('href', '#collapse' + random);
            binding.find('.panel-collapse.collapse').attr('id', 'collapse' + random);
            binding.find('.bindingAttr[data-l1key=name]').html(result);
            binding.find('.name').html(result);
            $('#div_bindings').append(binding);
        }
    });
});

$('.nav-tabs li a').off('click').on('click', function () {
    setTimeout(function () {
        taAutosize();
    }, 50);
});

$('#div_bindings').off('click', '.panel-heading').on('click', '.panel-heading', function () {
    setTimeout(function () {
        taAutosize();
    }, 50);
})

$("#div_bindings").delegate(".isActivated", 'change', function () {
    var el = $(this);
    var btn = el.closest('div').find('label').find('a');
    if (el.is(":checked")) {
        btn.removeClass('btn-success');
        btn.addClass('btn-danger');
        btn.text('{{× Disable}}');
    } else {
        btn.removeClass('btn-danger');
        btn.addClass('btn-success');
        btn.text('{{Enable}}');
    }
});

$("#div_bindings").delegate(".feedbackSpeech", 'keyup', function () {
    var el = $(this).closest('.binding');
    var listVarCount = el.find('.div_infoCmd').find('.varCmd').length;
    var textVarCount = $(this).val().split('{#}').length - 1;
    var count = 0;
    while (listVarCount != textVarCount) {
        count += 1;
        if (listVarCount > textVarCount) {
            el.find('.div_infoCmd').find('.varCmd:last').remove();
        } else if (listVarCount < textVarCount) {
            addInfoCmd({}, el);
        }
        var listVarCount = el.find('.div_infoCmd').find('.varCmd').length;
        var textVarCount = $(this).val().split('{#}').length - 1;
        if (count > 10) {
            break;
        }
    }
});

$("#div_bindings").sortable({
    axis: "y",
    cursor: "move",
    items: ".binding",
    placeholder: "ui-state-highlight",
    tolerance: "intersect",
    forcePlaceholderSize: true
});

$('.reload').on('click', function () {
    var reloadConfirm = 0;
    var username = '';
    var psssword = '';
    bootbox.prompt({
        title: '<i class="fa fa-exclamation-triangle"></i> {{Beware: Please choose your operation carefully!}}',
        inputType: 'select',
        inputOptions: [
            {
                text: '{{Choose a loading option...}}',
                value: '',
            },
            {
                text: '{{Reload assistant without bindings}}',
                value: 'mode_1',
            },
            {
                text: '{{Reload assistant with current bindings}}',
                value: 'mode_2',
            },
            {
                text: '{{Delete assistant}}',
                value: 'mode_3',
            }
        ],
        buttons: {
            confirm: {
                label: '<i class="fa fa-check"></i> {{confirm}}',
                className: 'btn-success'
            },
            cancel: {
                label: '<i class="fa fa-times"></i> {{cancel}}',
                className: 'btn-danger'
            }
        },
        callback: function (result) {
            if (result == 'mode_1' || result == 'mode_2') {
                var mode = result;
                var loading = bootbox.dialog({
                    message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> {{Trying to load assistant...}}</div>',
                    closeButton: false
                });
                $.ajax({
                        type: "POST",
                        url: "plugins/snips/core/ajax/snips.ajax.php",
                        data: {
                            action: "tryToFetchDefault",
                            option: mode,
                        },
                        dataType: 'json',
                        global: false,
                        error: function (request, status, error) {
                            handleAjaxError(request, status, error);
                        },
                        success: function (data) {
                            var msg = '';
                            var title = '';
                            loading.modal('hide');
                            if (data.result == 1) {
                                title = '<a style="color:#5cb85c;"><i class="fa fa-check"></i> {{Success}}</a>';
                                msg = '{{Assistant loaded!}}';

                                bootbox.alert({
                                    title: title,
                                    message: msg,
                                    callback: function (result) {
                                        location.reload();
                                    },
                                    closeButton: false
                                });
                            } else if(data.result == 0 || data.result == -1 || data.result == -2){
                                bootbox.prompt({
                                    title: "{{SSH username: }}",
                                    inputType: 'text',
                                    callback: function (result) {
                                        if (result) {
                                            username = result;
                                            bootbox.prompt({
                                                title: "{{SSH password: }}",
                                                inputType: 'password',
                                                callback: function (result) {
                                                    if (result) {
                                                        password = result;
                                                        var loading2 = bootbox.dialog({
                                                            message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> {{Loading assistant from device...}}</div>',
                                                            closeButton: false
                                                        });
                                                        $.ajax({
                                                            type: "POST",
                                                            url: "plugins/snips/core/ajax/snips.ajax.php",
                                                            data: {
                                                                action: "reload",
                                                                username: username,
                                                                password: password,
                                                                option: mode,
                                                            },
                                                            dataType: 'json',
                                                            global: false,
                                                            error: function (request, status, error) {
                                                                handleAjaxError(request, status, error);
                                                            },
                                                            success: function (data) {
                                                                var msg = '';
                                                                var title = '';
                                                                loading2.modal('hide');
                                                                if (data.result == 1) {
                                                                    title = '<a style="color:#5cb85c;"><i class="fa fa-check"></i> {{Success}} </a>';
                                                                    msg = '{{Assistant loaded!}}';
                                                                } else
                                                                if (data.result == 0) {
                                                                    title = '<a style="color:#d9534f;"><i class="fa fa-times"></i> {{Failed}} </a>';
                                                                    msg = '{{Can not fetch assistant!}}';
                                                                } else
                                                                if (data.result == -1) {
                                                                    title = '<a style="color:#d9534f;"><i class="fa fa-times"></i> {{Failed}} </a>';
                                                                    msg = '{{Wrong username/ password!}}';
                                                                } else
                                                                if (data.result == -2) {
                                                                    title = '<a style="color:#d9534f;"><i class="fa fa-times"></i> {{Failed}} </a>';
                                                                    msg = '{{Connection error. Please go to -> [plugin] -> [snips] -> [configuration]. Check if you set a correct [Master Snips devices IP address]!}}';
                                                                } else {
                                                                    title = '<a style="color:#d9534f;"><i class="fa fa-times"></i> {{Failed}}</a>';
                                                                    msg = data.result;
                                                                }

                                                                bootbox.alert({
                                                                    title: title,
                                                                    message: msg,
                                                                    callback: function (result) {
                                                                        location.reload();
                                                                    },
                                                                    closeButton: false
                                                                });
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });

                            }else{
                                bootbox.alert({
                                    title: '<a style="color:#d9534f;"><i class="fa fa-times"></i> {{Failed}}</a>',
                                    message: data.result,
                                    closeButton: false
                                });
                            }
                        }
                    });
            }else if (result == 'mode_3') {
                bootbox.confirm({
                title: "Attention",
                message: "{{This operation will delete all the intents and its binding records! Would you continue?}}",
                buttons: {
                    confirm: {
                        label: '<i class="fa fa-check"></i> {{Yes}}',
                        className: 'btn-success'
                    },
                    cancel: {
                        label: '<i class="fa fa-times"></i> {{No}}',
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $('#div_alert').showAlert({
                            message: '{{Removing all intents}}',
                            level: 'danger'
                        });

                        $.ajax({
                            type: "POST",
                            url: "plugins/snips/core/ajax/snips.ajax.php",
                            data: {
                                action: "removeAll",
                            },
                            dataType: 'json',
                            global: false,
                            error: function (request, status, error) {
                                handleAjaxError(request, status, error);
                            },
                            success: function (data) {
                                if (data.state != 'ok') {
                                    $('#div_alert').showAlert({
                                        message: data.result,
                                        level: 'danger'
                                    });
                                    return;
                                }
                                $('#div_alert').showAlert({
                                    message: '{{Successfully removed all the skills!}}',
                                    level: 'success'
                                });
                                location.reload();
                            }
                        });
                    }
                }
            });
            }
        }
    });
});

$('.exportConfigration').on('click', function () {
    bootbox.prompt({
        title: '<i class="fa fa-download"></i> {{Export configuration}}',
        inputType: 'text',
        buttons: {
            confirm: {
                label: '{{Export}}',
                className: 'btn-success'
            },
            cancel: {
                label: '{{Cancel}}',
                className: 'btn-danger'
            }
        },
        callback: function (result) {
            if (result !== null && result != '') {
                $.ajax({
                    type: "POST",
                    url: "plugins/snips/core/ajax/snips.ajax.php",
                    data: {
                        action: "exportConfigration",
                        name: result,
                    },
                    dataType: 'json',
                    global: false,
                    error: function (request, status, error) {
                        handleAjaxError(request, status, error);
                    },
                    success: function (data) {
                        if (data.state != 'ok') {
                            $('#div_alert').showAlert({
                                message: data.result,
                                level: 'danger'
                            });
                            return;
                        }
                        $('#div_alert').showAlert({
                            message: '{{Successfully exported!}}',
                            level: 'success'
                        });
                        location.reload();
                    }
                });
            } else if (result = '') {
                $('#div_alert').showAlert({
                    message: '{{Please specify a name!}}',
                    level: 'warning'
                });
            }
        }
    });
});

$('.importConfigration').on('click', function () {
    $.ajax({
        type: "POST",
        url: "plugins/snips/core/ajax/snips.ajax.php",
        data: {
            action: "getConfigurationList",
        },
        dataType: 'json',
        global: false,
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            if (isset(data.result) && data.result != null && data.result != '') {
                var options = [{
                    text: '{{Choose a configuration file...}}',
                    value: '',
                }];

                for (var n in data.result) {
                    options.push({
                        text: data.result[n],
                        value: data.result[n]
                    });
                }

                bootbox.prompt({
                    title: '<i class="fa fa-download"></i> {{Import configuration}}',
                    inputType: 'select',
                    inputOptions: options,
                    buttons: {
                        confirm: {
                            label: '{{Import}}',
                            className: 'btn-success'
                        },
                        cancel: {
                            label: '{{Cancel}}',
                            className: 'btn-danger'
                        }
                    },
                    callback: function (result) {
                        if (result != null && result != '') {
                            $.ajax({
                                type: "POST",
                                url: "plugins/snips/core/ajax/snips.ajax.php",
                                data: {
                                    action: "importConfigration",
                                    configFileName: result,
                                },
                                dataType: 'json',
                                global: false,
                                error: function (request, status, error) {
                                    handleAjaxError(request, status, error);
                                },
                                success: function (data) {
                                    bootbox.alert({
                                        title: '<a style="color:#5cb85c;"><i class="fa fa-check"></i> {{Successed}}</a>',
                                        message: '{{Configuration file}} [' + result + '] {{has been imported!}}',
                                        callback: function (result) {
                                            location.reload();
                                        },
                                        closeButton: false
                                    });
                                }
                            });
                        }
                    },
                });
            } else {
                bootbox.alert({
                    title: '<a style="color:#d9534f;"><i class="fa fa-times"></i> {{Failed}}</a>',
                    message: '{{Can not find any configuration file!}}',
                    closeButton: false
                });
            }
        }
    });
});

$("#div_bindings").delegate(".playFeedback", 'click', function () {
    var org_text = $(this).closest('.binding').find('.feedbackSpeech').val();
    var vars = [];
    vars = $(this).closest('.binding').find('.varCmd').getValues('.ttsVarAttr');
    var language = $('span[data-l1key=configuration][data-l2key=language]').text();
    var cmdPlayer = $(this).closest('.binding').find('input[data-l1key=ttsPlayer]').val();
    $.ajax({
        type: "POST",
        url: "plugins/snips/core/ajax/snips.ajax.php",
        data: {
            action: "playFeedback",
            text: org_text,
            vars: vars,
            cmd: cmdPlayer,
            lang: language,
        },
        dataType: 'json',
        global: false,
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            if (data.state != 'ok') {
                $('#div_alert').showAlert({
                    message: data.result,
                    level: 'danger'
                });
                return;
            }
        }
    });
});

$('.resetMqtt').on('click', function () {
    $.ajax({
        type: "POST",
        url: "plugins/snips/core/ajax/snips.ajax.php",
        data: {
            action: "resetMqtt",
        },
        dataType: 'json',
        global: false,
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            if (data.state != 'ok') {
                $('#div_alert').showAlert({
                    message: data.result,
                    level: 'danger'
                });
                return;
            }
            $('#div_alert').showAlert({
                message: 'reseting MQTT client',
                level: 'success'
            });
        }
    });
});

$('.resetSlotsCmd').on('click', function () {
    $.ajax({
        type: "POST",
        url: "plugins/snips/core/ajax/snips.ajax.php",
        data: {
            action: "resetSlotsCmd",
        },
        dataType: 'json',
        global: false,
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            if (data.state != 'ok') {
                $('#div_alert').showAlert({
                    message: data.result,
                    level: 'danger'
                });
                return;
            }
            $('#div_alert').showAlert({
                message: 'reseting slot value to NULL',
                level: 'success'
            });
        }
    });
});

$('.fetchAssistant').on('click', function () {
    $.ajax({
        type: "POST",
        url: "plugins/snips/core/ajax/snips.ajax.php",
        data: {
            action: "fetchAssistant",
        },
        dataType: 'json',
        global: false,
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            if (data.state != 'ok') {
                $('#div_alert').showAlert({
                    message: data.result,
                    level: 'danger'
                });
                return;
            }
            $('#div_alert').showAlert({
                message: 'File has been fetched',
                level: 'success'
            });
        }
    });
});


function printEqLogic(_eqLogic) {
    $('#div_bindings').empty();
    if (isset(_eqLogic.configuration) && isset(_eqLogic.configuration.bindings)) {
        actionOptions = []
        for (var i in _eqLogic.configuration.bindings) {
            addBinding(_eqLogic.configuration.bindings[i], false);
        }

        jeedom.cmd.displayActionsOption({
            params: actionOptions,
            async: false,
            error: function (error) {
                $('#div_alert').showAlert({
                    message: error.message,
                    level: 'danger'
                });
            },
            success: function (data) {
                for (var i in data) {
                    $('#' + data[i].id).append(data[i].html.html);
                }
                taAutosize();
            }
        });
    }
}

function saveEqLogic(_eqLogic) {
    if (!isset(_eqLogic.configuration)) {
        _eqLogic.configuration = {};
    }
    _eqLogic.configuration.bindings = [];
    $('#div_bindings .binding').each(function () {
        var binding = $(this).getValues('.bindingAttr')[0];
        binding.condition = $(this).find('.condition').getValues('.conditionAttr');
        binding.action = $(this).find('.action').getValues('.expressionAttr');
        binding.ttsVar = $(this).find('.varCmd').getValues('.ttsVarAttr');
        _eqLogic.configuration.bindings.push(binding);
    });
    return _eqLogic;
}

function addBinding(_binding) {
    if (init(_binding.name) == '') {
        return;
    }

    if (init(_binding.enable) == '') {
        _binding.enable = 1;
    }

    var random = Math.floor((Math.random() * 1000000) + 1);

    var div = '<div class="binding panel panel-default" style="margin-bottom:10px;border-radius: 0px;">';
    div += '<div class="panel-heading">';
    div += '<h4 class="panel-title">';
    div += '<a data-toggle="collapse" data-parent="#div_bindings" href="#collapse' + random + '">';
    div += '<div class="name" style="display:inline-block;width: 50%;height: 100%; ">' + _binding.name + '</div>';
    div += '</a>';
    div += '<span class="pull-right" style="top: 0px !important;">';

    if (isset(_binding.action)) {
        div += '<span class="btn-sm label-info" style="margin-right: 20px;">' + _binding.action.length + ' {{actions}}</span>';
    } else {
        div += '<span class="btn-sm label-warning" style="margin-right: 20px;">{{No action}}</span>';
    }

    if (isset(_binding.nsr_slots)) {
        div += '<span class="btn-sm label-success" style="margin-right: 20px;">' + _binding.nsr_slots.length + ' {{slots}}</span>';
    } else {
        div += '<span class="btn-sm label-warning" style="margin-right: 20px;">{{No slot}}</span>';
    }

    if (_binding.enable == 1) {
        div += '<span class="btn-sm label-success" style="margin-right: 20px;">{{Enabled}}</span>';
    } else {
        div += '<span class="btn-sm label-danger" style="margin-right: 20px;">{{Disabled}}</span>';
    }

    div += '<span class="btn-group" role="group">';
    div += '<a class="btn btn-sm btn-default bt_duplicateBinding"><i class="fa fa-files-o"></i> {{Duplicate}}</a>';
    div += '<a class="btn btn-sm btn-danger bt_removeBinding"><i class="fa fa-minus-circle"></i></a>';
    div += '</span>';
    div += '</span>';
    div += '</h4>';
    div += '</div>';


    div += '<div id="collapse' + random + '" class="panel-collapse collapse in">';
    div += '<div class="panel-body">';
    div += '<div>';
    div += '<form class="form-horizontal" role="form">';

    div += '<div class="form-group">';
    div += '<label class="col-sm-1 control-label">{{Name}}</label>';
    div += '<div class="col-sm-2">';
    div += '<span class="bindingAttr btn btn-sm btn-default rename cursor" data-l1key="name"></span>';
    div += '</div>';

    if (isset(_binding.nsr_slots)) {
        div += '<label class="col-sm-2 control-label">{{Required Slots}}</label>';
        div += '<div class="col-sm-4">';
        for (x in _binding.nsr_slots) {
            div += '<span class="label label-primary" style="margin-right: 10px;font-size: 0.9em;">' + _binding.nsr_slots[x] + '</span>';
        }
        div += '</div>';
    }

    div += '<label class="col-sm-1 control-label">{{Status}}</label>';
    div += '<div class="col-sm-2">';
    if (!_binding.isActive) {
        div += '<span>';
        div += '<input style="display:none;" class="bindingAttr isActivated" type="checkbox" id="isActivated_' + random + '" data-l1key="enable">';
        div += '<label for="isActivated_' + random + '">';
        div += '<a class="btn btn-success btn-sm">Enable</a>';
        div += '</span>';
        div += '</div>';
    } else {
        div += '<span>';
        div += '<input style="display:none;" class="bindingAttr isActivated" type="checkbox" id="isActivated_' + random + '" data-l1key="enable" checked>';
        div += '<label for="isActivated_' + random + '">';
        div += '<a class="btn btn-danger btn-sm"><i class="fa fa-times"></i> {{Disable}}</a>';
        div += '</span>';
        div += '</div>';
    }
    div += '</div>';

    div += '<hr/>';

    div += '<div class="section-title"><strong>{{Condition(s)}}</strong>';
    div += '<a class="btn btn-xs btn-success bt_addCondition" style="margin-left: 15px;" data-toggle="tooltip" data-placement="top" title="{{Multiple conditions will be in \'AND\' relation}}"><i class="fa fa-plus-circle"></i> {{Add Condition}}</a>';
    div += '</div>';
    div += '<div class="div_condition"></div>';

    div += '<hr/>';

    div += '<div class="section-title"><strong>{{Action(s)}}</strong>';
    div += '<a class="btn btn-success btn-xs bt_addAction" style="margin-left: 15px;" ' +
        'data-toggle="tooltip" data-placement="top" title="{{Multiple actions will be executed from top to down}}"><i class="fa fa-plus-circle"></i> {{Add Action}}</a>';


    div += '</div>';
    div += '<div class="div_action"></div>';

    div += '<hr/>';

    div += '<div class="section-title" ><strong>{{TTS}}</strong>';
    //div += '<a class="btn btn-primary btn-xs playFeedback" style="margin-left: 15px;"><i class="fa fa-play"></i> {{Test Play}}</a>';
    div += '</div>';

    div += '<div class="div_feedback form-group">'

    div += '<div class="col-sm-6">';

    div += '<div class="input-group input-group-sm">';
    div += '<span class="input-group-addon" id="basic-addon1" style="width: 100px"> {{Player}} </span>';
    div += '<input class="bindingAttr form-control input-sm cmdAction" data-l1key="ttsPlayer"/>';
    div += '<span class="input-group-btn">';
    //div += '<a class="btn btn-default btn-sm listAction" data-type="action" ><i class="fa fa-tasks"></i></a>';
    div += '<a class="btn btn-default btn-sm listCmdPlayer" data-type="action"><i class="fa fa-list-alt"></i></a>';
    div += '<a class="btn btn-default playFeedback btn-sm" data-type="action" title="{{test play}}"><i class="fa fa-play"></i></a>';
    div += '</span></div>';


    div += '<textarea class="bindingAttr form-control ta_autosize feedbackSpeech"' +
        'data-l1key="ttsMessage" rows="2"' +
        'style="resize: none; overflow: hidden; word-wrap: break-word; height: 30px; font-size:12px;"' +
        'placeholder="Speech text" data-toggle="tooltip" ' +
        'data-placement="bottom" title="{{Use \'{#}\' to add dynamic variable, then setup variables following the same order}}">';
    div += '</textarea>';
    div += '</div>';

    div += '<div class="col-sm-6 div_infoCmd"></div>';

    div += '</div>';

    div += '</form>';
    div += '</div>';
    div += '</div>';
    div += '</div>';
    div += '</div>';

    $('#div_bindings').append(div);

    if (!isset(_binding.ttsPlayer)) {

        _binding.ttsPlayer = '#[Snips-Intents][Snips-TTS-'+MASTER_DEVICES+'][say]#';
    }

    $('#div_bindings .binding:last').setValues(_binding, '.bindingAttr');
    if (is_array(_binding.condition)) {
        for (var i in _binding.condition) {
            addCondition(_binding.condition[i], $('#div_bindings .binding:last'));
        }
    } else {
        if ($.trim(_binding.condition) != '') {
            addCondition(_binding.condition[i], $('#div_bindings .binding:last'));
        }
    }
    if (is_array(_binding.action)) {
        for (var i in _binding.action) {
            addAction(_binding.action[i], $('#div_bindings .binding:last'));
        }
    } else {
        if ($.trim(_binding.action) != '') {
            addAction(_binding.action, $('#div_bindings .binding:last'));
        }
    }

    if (is_array(_binding.ttsVar)) {
        for (var i in _binding.ttsVar) {
            addInfoCmd(_binding.ttsVar[i], $('#div_bindings .binding:last'));
        }
    } else {
        if ($.trim(_binding.ttsVar) != '') {
            addInfoCmd(_binding.ttsVar, $('#div_bindings .binding:last'));
        }
    }

    $('[data-toggle="tooltip"]').tooltip();

    $('.collapse').collapse();
    $("#div_bindings .binding:last .div_condition").sortable({
        axis: "y",
        cursor: "move",
        items: ".condition",
        placeholder: "ui-state-highlight",
        tolerance: "intersect",
        forcePlaceholderSize: true
    });
    $("#div_bindings .binding:last .div_action").sortable({
        axis: "y",
        cursor: "move",
        items: ".action",
        placeholder: "ui-state-highlight",
        tolerance: "intersect",
        forcePlaceholderSize: true
    });
    $("#div_bindings .binding:last .div_infoCmd").sortable({
        axis: "y",
        cursor: "move",
        items: ".infoCmd",
        placeholder: "ui-state-highlight",
        tolerance: "intersect",
        forcePlaceholderSize: true
    });
}

function addAction(_action, _el) {
    if (!isset(_action)) {
        _action = {};
    }
    if (!isset(_action.options)) {
        _action.options = {};
    }

    var div = '<div class="action">';
    div += '<div class="form-group">';

    div += '<div class="col-sm-6">';
    div += '<div class="input-group">';
    div += '<span class="input-group-btn">';
    div += '<a class="btn btn-default bt_removeAction btn-sm" data-type="action"><i class="fa fa-minus-circle"></i></a>';
    div += '</span>';
    div += '<input class="expressionAttr form-control input-sm cmdAction" data-l1key="cmd" data-type="action" />';
    div += '<span class="input-group-btn">';
    div += '<a class="btn btn-default btn-sm listAction" data-type="action" title="{{Select an action}}"><i class="fa fa-tasks"></i></a>';
    div += '<a class="btn btn-default btn-sm listCmdAction" data-type="action"><i class="fa fa-list-alt"></i></a>';
    div += '</span>';
    div += '</div>';
    div += '</div>';

    var actionOption_id = uniqId();
    div += '<div class="col-sm-6">';
    div += '<span class="actionOptions" id="' + actionOption_id + '"></span>';

    div += '<span class="slotsOptions">';

    if (isset(_action.options.HT) && isset(_action.options.LT)) {
        div += '<span class="input-group input-group-sm">';
        div += '<span class="input-group-addon" style="width: 100px">0% => </span>';
        div += '<input class="expressionAttr form-control input-sm" data-l1key="options" data-l2key="LT">';

        div += '<span class="input-group-addon" style="width: 100px">100% => </span>';
        div += '<input class="expressionAttr form-control input-sm" data-l1key="options" data-l2key="HT">';
        div += '<span>'
    }

    div += '</span>';
    div += '</div>';
    div += '</div>';

    if (isset(_el)) {
        _el.find('.div_action').append(div);
        _el.find('.action:last').setValues(_action, '.expressionAttr');
    } else {
        $('#div_action').append(div);
        $('#div_action .action:last').setValues(_action, '.expressionAttr');
    }

    actionOptions.push({
        expression: init(_action.cmd, ''),
        options: _action.options,
        id: actionOption_id
    });
}

function addCondition(_condition, _el) {
    if (!isset(_condition)) {
        _condition = {};
    }
    if (!isset(_condition.options)) {
        _condition.options = {};
    }

    var div = '<div class="condition">';
    div += '<div class="form-group ">';

    div += '<div class="col-sm-6">';
    div += '<div class="input-group input-group-sm">';

    div += '<span class="input-group-btn">';
    div += '<a class="btn btn-default bt_removeCondition btn-sm" data-type="condition"><i class="fa fa-minus-circle"></i></a>';
    div += '</span>';

    div += '<span class="input-group-addon">{{ONLY IF}}</span>';

    var selectSlotsId = uniqId();

    div += '<select class="conditionAttr form-control input-sm" data-l1key="pre" id="' + selectSlotsId + '">';
    div += '</select>';

    div += '</div></div>'

    div += '<div class="col-sm-6">';
    div += '<div class="input-group input-group-sm">';
    div += '<span class="conditionAttr input-group-addon" data-l1key="relation">=</span>';

    div += '<input class="conditionAttr form-control input-sm" data-l1key="aft">';
    div += '</div>';
    div += '</div>';

    if (isset(_el)) {
        _el.find('.div_condition').append(div);
        displaySlots(selectSlotsId);
        _el.find('.condition:last').setValues(_condition, '.conditionAttr');
      	var select = $('#' + selectSlotsId)
        if (select.val() == "-1" && select.children().length >= 2) {
          let value = select.find('option:eq(1)').val()
          select.val(value).change()
      	}
    } else {
        $('#div_condition').append(div);
        displaySlots(selectSlotsId);
        $('#div_condition .condition:last').setValues(_condition, '.conditionAttr');
    }
}

function addInfoCmd(_infoCmd, _el) {
    var div = '<div class="varCmd" style="width: 100%; margin-bottom: 5px;">';
    div += '<div class="input-group input-group-sm infoCmd" >';
    div += '<span class="input-group-btn ">';
    div += '<a class="btn btn-default btn-sm" style="width: 100px" data-toggle="tooltip" data-placement="top" title=" {{Drag to change order}}"><span class="glyphicon glyphicon-sort" aria-hidden="true"></span>' + "&nbsp;&nbsp;&nbsp;" + '{{Variable}}</a></span>'
    div += '<input value="" class="ttsVarAttr form-control input-sm" data-l1key="cmd" >';
    div += '<span class="input-group-btn">';
    div += '    <button class="btn btn-default listInfoCmd" type="button" title="{{Select a value}}">';
    div += '    <i class="fa fa-list-alt"></i>';
    div += '    </button>';
    div += '</span>';
    div += '</div>';

    div += '<div class="infoOptions">';

    if (isset(_infoCmd.options)) {
        div += '<span class="input-group input-group-sm">';
        div += '<span class="input-group-addon" style="width: 100px">Status "0" => </span>';
        div += '<input class="ttsVarAttr form-control input-sm" data-l1key="options" data-l2key="zero">';

        div += '<span class="input-group-addon" style="width: 100px">Status "1" => </span>';
        div += '<input class="ttsVarAttr form-control input-sm" data-l1key="options" data-l2key="one">';
        div += '<span>'
    }

    div += '</div>';
    div += '</div>';

    if (isset(_infoCmd)) {
        _el.find('.div_infoCmd').append(div);
        _el.find('.varCmd:last').setValues(_infoCmd, '.ttsVarAttr');
    } else {
        _el.find('.div_infoCmd').append(div);
        _el.find('.varCmd:last').setValues(_infoCmd, '.ttsVarAttr');
    }
}

function addCmdToTable(_cmd) {

    var tr = '<div class="cmd" data-cmd_id="' + init(_cmd.id) + '" style="float:left; margin-right: 10px;margin-bottom: 10px;">';
    tr += '<span class="cmdAttr" data-l1key="id" style="display:none;"></span>';
    tr += '<span class="cmdAttr" data-l1key="logicalId" style="display:none;"></span>';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="name" disabled="disabled" >';
    tr += '</div>';

    $('#table_cmd').append(tr);
    $('#table_cmd div:last').setValues(_cmd, '.cmdAttr');

    if (isset(_cmd.type)) {
        $('#table_cmd tbody tr:last .cmdAttr[data-l1key=type]').value(init(_cmd.type));
    }
    jeedom.cmd.changeType($('#table_cmd div:last'), init(_cmd.subType));
}

function displaySlots(_selectSlotsId) {
    jeedom.eqLogic.getCmd({
        id: $('#intentId').val(),
        async: false,
        success: function (cmds) {
            var result = '';
            for (var i in cmds) {
                if (cmds[i].type == 'info') {
                    result += '<option value="' + cmds[i].id + '" data-type="' + cmds[i].type + '"  data-subType="' + cmds[i].subType + '" >#[' + cmds[i].name + ']#</option>';
                }
            }
            var select = $('#' + _selectSlotsId);
            select.empty();
            var selectCmd = '<option value="-1">{{Select a Slot &#8681;}}</option>';
            selectCmd += result;
            select.append(selectCmd);
        }
    });
}

function displayValueMap(_el) {

    var span = '<span class="input-group input-group-sm">';
    span += '<span class="input-group-addon" style="width: 100px">0% => </span>';
    span += '<input value="0" class="expressionAttr form-control input-sm" data-l1key="options" data-l2key="LT">';

    span += '<span class="input-group-addon" style="width: 100px">100% => </span>';
    span += '<input value="100" class="expressionAttr form-control input-sm" data-l1key="options" data-l2key="HT">';
    span += '<span>'

    _el.append(span);
}

function displayBinaryMap(_el, _cmd) {

    var span = '<span class="input-group input-group-sm">';
    span += '<span class="input-group-addon" style="width: 100px">Status "0" => </span>';
    span += '<input value="OFF" class="ttsVarAttr form-control input-sm" data-l1key="options" data-l2key="zero">';

    span += '<span class="input-group-addon" style="width: 100px">Status "1" => </span>';
    span += '<input value="ON" class="ttsVarAttr form-control input-sm" data-l1key="options" data-l2key="one">';
    span += '<span>'

    _el.append(span);
}
