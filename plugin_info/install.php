<?php
require_once dirname(__FILE__) . '/../../../core/php/core.inc.php';
require_once dirname(__FILE__) . '/../class/snips.utils.class.php';

function snips_install() {
    SnipsUtils::create_task_cron();

    $lang = translate::getLanguage();
    if ($lang == 'fr_FR') {
        config::save('defaultTTS', 'Désolé, je ne trouve pas les actions!', 'snips');
    } else if ($lang == 'en_US') {
        config::save('defaultTTS', 'Sorry, I cant find any actions!', 'snips');
    }

    config::save('dynamicSnipsTTS', 1, 'snips');
    // snips variables
    config::save('snipsMsgSession', 0, 'snips');
    config::save('snipsMsgSiteId', 0, 'snips');
    config::save('snipsMsgHotwordId', 0, 'snips');
}

function snips_update() {
    SnipsUtils::create_task_cron();

    config::save('dynamicSnipsTTS', 1, 'snips');
    // snips variables
    if (config::byKey('snipsMsgSession', 'snips', "NULL") == "NULL") {
        config::save('snipsMsgSession', 0, 'snips');
    }

    if (config::byKey('snipsMsgSiteId', 'snips', "NULL") == "NULL") {
        config::save('snipsMsgSiteId', 0, 'snips');
    }

    if (config::byKey('snipsMsgHotwordId', 'snips', "NULL") == "NULL") {
        config::save('snipsMsgHotwordId', 0, 'snips');
    }
}

function snips_remove() {
    SnipsUtils::delete_task_cron();

    $obj = SnipsUtils::get_snips_intent_object();
    if (is_object($obj)) {
        $obj->remove();
        SnipsUtils::logger('removed object: Snips-Intents');
    }

    $eqLogics = eqLogic::byType('snips');
    foreach ($eqLogics as $eq) {
        $cmds = snipsCmd::byEqLogicId($eq->getLogicalId);
        foreach ($cmds as $cmd) {
            SnipsUtils::logger('removed slot cmd: '.$cmd->getName());
            $cmd->remove();
        }
        SnipsUtils::logger('removed intent entity: '.$eq->getName());
        $eq->remove();
    }

    SnipsUtils::logger('removed Snips Voice assistant!');

    $resource_path = realpath(dirname(__FILE__) . '/../resources');
    passthru(
        'sudo /bin/bash '. $resource_path .'/remove.sh '.
        $resource_path .' > '. log::getPathToLog('snips_dep') .' 2>&1 &'
    );
    return true;
}
?>