<?php

ini_set('display_errors','On');

require_once '../vendor/autoload.php';

$sql = "
    SELECT *
    FROM 
	planneddebtorsrollcall.notify.Subscriber as s
    where
        1=1
        or (ClientGroupId= 6 or clientgroupid=18)
    order by
	GroupName,
	coalesce(PhysicalAddress,'яяя'),
	FullName
        ";
//echo "<pre>$sql</pre>";
Billing\Core::configureDefault();
$st = Billing\Core::getEm()->getConnection()->prepare($sql);
$st->execute();
//$st->nextRowset();

$clientGroups = array();
/* @var $eachClientGroup Notify\ClientGroup */
$eachClientGroup = null;

while ($eachSubscriberAsRow = $st->fetch(PDO::FETCH_ASSOC)) {
    if (!$eachClientGroup || $eachSubscriberAsRow["ClientGroupId"] != $eachClientGroup->getId()) {
        $eachClientGroup = new Notify\ClientGroup;
        $eachClientGroup->setId($eachSubscriberAsRow["ClientGroupId"]);
        $eachClientGroup->setGroupName($eachSubscriberAsRow["GroupName"]);

        $clientGroups[] = $eachClientGroup;
    }

//    echo "{$eachObjectAsRow['path2']} {$eachObjectAsRow['name']}<br>";
    $eachSubscriber = new \Billing\Domain\Subscriber();
    $eachSubscriber->setClientGroup($eachClientGroup);
    $eachSubscriber->setId($eachSubscriberAsRow["SubscriberId"]);
    $eachSubscriber->setFullName($eachSubscriberAsRow["FullName"]);

    $eachLegalInfo = new \Billing\Domain\LegalInfo();
    $eachLegalInfo->setPhysicalAddress($eachSubscriberAsRow["PhysicalAddress"]);
    $eachLegalInfo->setPhoneNumber($eachSubscriberAsRow["Phone"]);
    $eachSubscriber->setLegalInfo($eachLegalInfo);

    $eachClientGroup->getSubscribers()->add($eachSubscriber);
}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "www.w3.org/TR/html4/strict.dtd">
<html>
    <head>
        <meta http-equiv=Content-Type content="text/html;charset=utf-8">
        
        <title>СМС</title>

        <link rel='stylesheet' type='text/css' href='library/jquery-ui-1.10.3.custom/css/redmond/jquery-ui-1.10.3.custom.min.css'>
        <link rel='stylesheet' type='text/css' href='library/notify/css/document.css'>
        <link rel='stylesheet' type='text/css' href='library/notify/css/searcher.css'>
        <link rel='stylesheet' type='text/css' href='library/notify/css/bottom.css'>
        <link rel='stylesheet' type='text/css' href='library/notify/css/torObject.css'>
        <link rel='stylesheet' type='text/css' href='library/notify/css/table.content.css'>
        <link rel='stylesheet' type='text/css' href='library/notify/css/clientGroup.css'>
        <link rel='stylesheet' type='text/css' href='library/notify/css/subscriber.css'>
        <link rel='stylesheet' type='text/css' href='library/notify/css/sending.css'>

        <script src='library/js/DisplacingTimer.js'></script>
        <script src='library/js/MulticastDelegate.js'></script>
        <script src='library/jquery-ui-1.10.3.custom/js/jquery-1.9.1.js'></script>
        <script src='library/jquery-ui-1.10.3.custom/js/jquery-ui-1.10.3.custom.min.js'></script>
        <script src='library/notify/js/TorObject.js'></script>
        <script src='library/notify/js/ClientGroup.js'></script>
        <script src='library/notify/js/Subscriber.js'></script>
        <script src='library/notify/js/Searcher.js'></script>
        <script src='library/notify/js/SearcherView.js'></script>
        <script src='library/notify/js/Document.js'></script>
        <script src='library/notify/js/Sender.js'></script>

        <script>
<?php

function showClientGroupAsJs(\Billing\Domain\ClientGroup $clientGroup, $level = 0) {
    $view = new Page\View\HtmlElementView(null);
    ?>
                (function() {
                    var result = new ClientGroup();

                    result.groupName = '<?php echo $clientGroup->getGroupName(); ?>';
                    result.id = '<?php echo $clientGroup->getId(); ?>';
    <?php
    //клиенты
    /* @var $eachSubscriber \Billing\Domain\Subscriber */
    foreach ($clientGroup->getSubscribers() as $eachSubscriber) {
        //var_dump($eachEmployeeAsArray);
        ?>
                        var eachSubscriber = new Subscriber();
                        eachSubscriber.parent = result;
                        eachSubscriber.id = <?php echo $eachSubscriber->getId(); ?>;
                        eachSubscriber.fullName = '<?php echo $view->escapeJsString(preg_replace('/\r?\n\r?/', '\\n', $eachSubscriber->getFullName())); ?>';
                        eachSubscriber.phoneNumber = '<?php echo $view->escapeJsString(preg_replace('/\r?\n\r?/', '\\n', $eachSubscriber->getLegalInfo()->getPhoneNumber())); ?>';
                        eachSubscriber.physicalAddress = '<?php echo $view->escapeJsString(preg_replace('/\r?\n\r?/', '\\n', $eachSubscriber->getLegalInfo()->getPhysicalAddress())); ?>';
                        eachSubscriber.selectModeChanged.add(result, result.subscriber_selectModeChanged);
                        result.children.push(eachSubscriber);

                        new SubscriberView(eachSubscriber);
        <?php
    }
    ?>
                    new ClientGroupView(result);

                    return result;
                })(); //showClientGroupAsJs(<?php echo $clientGroup->getId(); ?>)
    <?php
}
?>
        </script>        
    </head>
    <body>
        <div id="p_loading">
            <div id="p_loading_progressbar">
            </div>
        </div>
        <script>
            //прогрессбар
            document.$progressbar = $("#p_loading_progressbar").progressbar({max: <?php echo sizeof($clientGroups); ?> - 1});

            document.clientGroups = [];
        </script>

        <div id="p_header" class="ui-widget-header">
            <span id="p_header_title" >СМС сервис ООО "Теле-плюс"</span>
            <div id="p_header_searcher" class="ui-widget-header">
                <input id="p_header_searcher_term" type="text" title="Поиск"/>
                <span id="p_header_searcher_index"></span>
                <input id="p_header_searcher_prev" type="button" value="Назад" title="Назад"></input>
                <input id="p_header_searcher_next" type="button" value="Вперед" title="Вперед (Enter)"></input>
                <input id="p_header_searcher_reset" type="button" value=" Отменить поиск " title="Отменить поиск (Esc)"></input>
            </div>
        </div>
        <div id="p_subscribers">

            <div id="p_subscribers_data">
                <?php
                $progressbarValue = 0;

                /* @var $progressbarValue \Billing\Domain\ClientGroup */
                foreach ($clientGroups as $eachClientGroup) {
                    ?>
                    <?php
                    new Notify\View\ClientGroupView($eachClientGroup, null, null, true);
                    ?>
                    <script>
                        var eachClientGroup = <?php showClientGroupAsJs($eachClientGroup); ?>
                        document.clientGroups.push(eachClientGroup);

                        eachClientGroup.each(function(subscriber) {
    //                            subscriber.selectModeChanged.add(document, subscriber_selectModeChanged);
                        });

                        document.$progressbar.progressbar({value: <?php echo++$progressbarValue; ?>});
                    </script>
                    <?php
                }
                ?>
            </div>
        </div>

        <div id="p_bottom" class="ui-widget-header">
            <input id="p_bottom_message" type="text" title="Сообщение">
            <input id="p_bottom_sms" type="button" value="SMS" title="Отправить сообщение выбраным клиентам (Ctrl+Enter)"></input>
        </div>
        <div id="p_sending">
            <div id="p_sending_log" class="ui-corner-all">
                <table id="p_sending_log_data"></table>
            </div>
            <div id="p_sending_progress"></div>
        </div>
        <script>
//            var $subscribers = $("#p_subscribers_data");
        </script>

        <script>
            $(document).ready(function() {
                ready();
            })
        </script>
    </body>
</html>