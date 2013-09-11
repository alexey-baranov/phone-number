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
class PhoneNumber {
    protected $_code;
    protected $_local;
    
    /**
     * рзабирает первый номер
     * 
     * @param string $source
     * @rerurn PhoneNumber
     */
    static function parse($source){
        $source0= $source;
        $result= new PhoneNumber();
        
        //отбросил все лишнее после первого номера
        $source= preg_replace('/([+\d( )\-]*).*/', "\\1", $source);
        
        //+7 на 8
        $source= preg_replace('/[+]\s*7/', "8", $source);
        
        //отбросил тире и пробелы
        $source= preg_replace('/[\- ]/', "", $source);
        
        $matches= array();
        //явный код в скобках 
        if (preg_match('/^8?\((\d+)\)(\d+)$/', $source, $matches)){
            $result->setCode($matches[1]);
            $result->setLocal($matches[2]);
        }
        //подразумевается код в мобильном
        else if (preg_match('/^8?(\d{3})(\d{7})$/', $source, $matches)){
            $result->setCode($matches[1]);
            $result->setLocal($matches[2]);
        }
        //кода нет
        else if (strlen($source)>2){
            $result->setCode(null);
            $result->setLocal($source);
        }
        //непойми чего
        else{
            throw new \Exception("incorrect phone number '{$source0}'");
        }
        return $result;
    }
    
    function isLocal() {
        return $this->_code == null;
    }
    
    function isMobile(){
        return strlen($this->_code)==3 && strlen($this->_local)==7;
    }
    
    public function getCode() {
        return $this->_code;
    }

    public function setCode($code) {
        $this->_code = $code;
        return $this;
    }

    public function getLocal() {
        return $this->_local;
    }

    public function setLocal($local) {
        $this->_local = $local;
        return $this;
    }

    
    function __toString() {
        $result= "";
        if ($this->_code){
            $result= "8 ($this->_code) ";
        }
        
        $localElements=array();
        for ($pos= strlen($this->_local); $pos>0;){
            if ($pos>3){
                array_unshift($localElements, substr($this->_local, $pos-2, 2));
                $pos-=2;
            }
            else{
                array_unshift($localElements, substr($this->_local, 0, $pos));
                $pos=0;
            }
        }
        
        $result.= implode("-", $localElements);
        
        return $result;
    }
}