<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
namespace PhoneNumber;
/**
 * Description of PhoneNumber
 *
 * @author Администратор
 */
class Utils {
    /**
     * рзабирает строку с несколькими номерами разделенными ',' ';'
     * 
     * @param string $source
     * @rerurn PhoneNumber[]
     */
    static function safeParsePhoneNumbers($source){
        $result= array();
        $phoneNumbersAsString= preg_split('/[,;]/', $source);
        
        foreach($phoneNumbersAsString as $eachPhoneNumberAsString){
            try{
                $result[]= PhoneNumber::parse($eachPhoneNumberAsString);
            }
            catch(\Exception $ex){}
        }
        
        return $result;
    }
    
    /**
     * Возвращает первый мобильный номер
     * @param type $phoneNumbers
     * @return type
     */
    static function getFirstMobileNumber($phoneNumbers) {
        foreach($phoneNumbers as $eachPhoneNumber){
            if ($eachPhoneNumber->isMobile()){
                return $eachPhoneNumber;
            }
        }
    }
}