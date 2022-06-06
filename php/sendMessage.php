<?php
require_once('fns.php');
/**
 * Realiza validación de metodo http utilizado para la petición,
 * en este caso solo se admite POST por lo que si la petición se recibe 
 * vía get, put, delete, u otro imprimirá respuesta json indicando error
 */
if ($_SERVER['REQUEST_METHOD'] !== 'POST'){
    printError('Esta ruta solo se puede acceder vía POST');
}



$idOrigen = time();

define("_USER_","dev_35");
define('_PASSWORD_','y*PUZM2znP9');

define('_URL_WEBSERVICE_','https://b2c.marcatel.com.mx/MarcatelSMSWCF/ServicioInsertarSMS.svc?wsdl');


/**
 * Registrá en archivo de log los datos de la petición realizada
 */
$str_log = "----".date('Y-m-d H:i:s')."----\n".json_encode($_POST)."\n";
$oFileLog = fopen("log.txt", "r+");
fwrite($oFileLog, $str_log);
fclose($oFileLog);

/**realiza validación de datos ingresados por el usuario, 
 * en caso de ser incorrectos los datos ingresados 
 * imprimirá respuesta json indicando error
 */

#LADA
$nLADA = null;
if($_POST['nLada'] > 0){ $nLADA = $_POST['nLada']; }
else if(strlen($_POST['nLadaCustom']) > 0 and strlen($_POST['nLadaCustom']) < 5){ $nLADA = $_POST['nLadaCustom'];}
else{
    printError('Debe proporcionar LADA');
}

#TELEFONO
if(!isset($_POST['nTelefono'])){
    printError('Debe proporcionar el número teléfonico');
}else if(strlen($_POST['nTelefono']) != 10){
    printError('El número teléfonico debe ser a 10 digitos.');
}else{
    $nTelefono = $_POST['nTelefono'];
}

#MENSAJE
if(!isset($_POST['sMensaje'])){
    printError('Debe proporcionar el mensaje a enviar');
}else if(strlen($_POST['sMensaje']) > 160){
    printError('el mensaje debe contener maximo 160 caracteres.');
}else{
    $sMensaje = $_POST['sMensaje'];
}

#Campaña
if(!isset($_POST['sCampania'])){
    printError('Debe proporcionar la campaña');
}else if(strlen($_POST['sCampania']) > 50){
    printError('La campaña debe contener máximo 50 caracteres.');
}else{
    $sCampania = $_POST['sCampania'];
}

#Prioridad
if(!isset($_POST['nPrioridad']) or ($_POST['nPrioridad'] > 1 and $_POST['nPrioridad'] < 0)){
    $nPrioridad = 0;
}else{
    $nPrioridad = $_POST['nPrioridad'];
}




/**
 * Creación de la estructura del arreglo a enviar para el consunmo del servició
 */

$datos = 
[
    'Usuario'=> _USER_,
    'Password'=> _PASSWORD_,
    'Telefonos'=> json_encode([
        [
            'Lada'      =>$nLADA,
            'Tel'       =>$nTelefono,
            'Mensaje'   =>$sMensaje,
            'IdOrigen'  => $idOrigen,
            'Aux'       =>rand(0,99),//Simula auxiliar 1
            'Aux2'      =>rand(99,999), //simula auxiliar 2
            'Prioridad' =>$nPrioridad,
            'DobleVia'  =>"0",
            'MMensaje'  =>"0", //No se envia multiples mensajes
            'Campaña'   => $sCampania,
        ] 
    ])
];

$options = Array(
	"uri"   => _URL_WEBSERVICE_,
	"style"=> SOAP_RPC,
	"use"=> SOAP_ENCODED,
	"soap_version"=> SOAP_1_1,
	"cache_wsdl"=> WSDL_CACHE_BOTH,
	"connection_timeout" => 15,
	"trace" => false,
	"encoding" => "UTF-8",
	"exceptions" => false,
);


$soap = new SoapClient(_URL_WEBSERVICE_, $options);
$result = $soap->InsertaMensajes_xl($datos);

if($result->InsertaMensajes_xlResult->code !== 200){

    printResponse($result->InsertaMensajes_xlResult->code);
}else{
    print json_encode(['error'=>false]);
}