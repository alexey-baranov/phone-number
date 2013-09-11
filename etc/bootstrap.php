<?php

namespace Billing;
date_default_timezone_set("Etc/GMT-6"); 
//Logger::getRootLogger()->debug(PHP_OS);

//define('APPLICATION_PATH', __DIR__);
//define('LIB_PATH', __DIR__."/../lib");

require_once __DIR__.'/../vendor/autoload.php';

\Doctrine\Common\Annotations\AnnotationRegistry::registerFile(__DIR__ . '/../vendor/doctrine/orm/lib/Doctrine/ORM/Mapping/Driver/DoctrineAnnotations.php');

Core::configureDefault();

\Page\View\ViewManager::setViewClass('Billing\Subscriber', 'Billing\View\SubscriberView');