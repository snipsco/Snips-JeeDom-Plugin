<?php
try {
    require_once dirname(__FILE__) . '/../../../../core/php/core.inc.php';

    include_file('core', 'authentification', 'php');
    if (!isConnect('admin')) {
        throw new Exception(__('401 - Unauthorized access', __FILE__));
    }

    if (init('action') == 'reload') {
        
        $res = snips::fetchAssistantJson(init('username') , init('password'));

        if ($res == 1) {
            $configJson = snips::exportConfigration(null, false);
            snips::deleteAssistant();
            snips::reloadAssistant();
            if (init('option') == 'mode_2') {
                snips::debug('[AJAX reload] option :'.init('option'). ' Type is :'.gettype(init('option')));
                snips::debug('[AJAX reload] configJson :'.$configJson);
                snips::importConfigration(null, $configJson);
            }
        }
        ajax::success($res);
    }

    if (init('action') == 'tryToFetchDefault') {
        
        $res = snips::tryToFetchDefault();

        if ($res == 1) {
            $configJson = snips::exportConfigration(null, false);
            snips::deleteAssistant();
            snips::reloadAssistant();
            
            if (init('option') == 'mode_2') {
                snips::debug('[AJAX reload] option :'.init('option'). ' Type is :'.gettype(init('option')));
                snips::debug('[AJAX reload] configJson :'.$configJson);
                snips::importConfigration(null, $configJson);
            }
        }
        ajax::success($res);
    }

    if (init('action') == 'isSnipsRunLocal') {
        $res = snips::isSnipsRunLocal();
        ajax::success($res);
    }

    if (init('action') == 'exportConfigration') {
        snips::exportConfigration(init('name'));
        ajax::success();
    }

    if (init('action') == 'getConfigurationList') {
        $res = snips::displayAvailableConfigurations();
        ajax::success($res);
    }

    if (init('action') == 'importConfigration') {
        snips::importConfigration(init('configFileName'));
        ajax::success();
    }

    if (init('action') == 'removeAll') {
        snips::deleteAssistant();
        ajax::success();
    }

    if (init('action') == 'playFeedback') {
        snips::debug('[TTs] Testing Play...');
        $text = snips::generateFeedback(init('text') , init('vars') , true);
        snips::debug('[AJAX playFeedback] player cmd: '.init('cmd'));
        snips::playTTS(init('cmd'), $text);
        ajax::success();
    }

    if (init('action') == 'resetMqtt') {
        snips::resetMqtt();
        ajax::success();
    }

    if (init('action') == 'resetSlotsCmd') {
        snips::resetSlotsCmd();
        ajax::success();
    }

    if (init('action') == 'getSnipsType') {
        $cmd = cmd::byId(init('cmd'));
        $snips_type = $cmd->getConfiguration('entityId');
        ajax::success($snips_type);
    }

    if (init('action') == 'fetchAssistant') {
        snips::fetchAssistantJson();
        ajax::success();
    }

    if (init('action') == 'getMasterDevices') {
        $res = config::byKey('masterSite', 'snips', 'default');
        ajax::success($res);
    }
    

    throw new Exception(__('No method corresponding to : ', __FILE__) . init('action'));
}

catch(Exception $e) {
    ajax::error(displayExeption($e) , $e->getCode());
}