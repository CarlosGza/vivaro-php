<?php
function printError($message){
    print json_encode(['error'=>true,'info'=>$message]);
    exit();
}

function printResponse($code){
    $codes = [
        201=>'Usuario sin saldo suficiente.',
        401=>'Usuario NO Autorizado para usar el servicio',
        402=>'Lada no autorizada.',
        403=>'Valor indicado para DobleVia incorrecto.',
        404=>'Valor indicado para Multimensaje incorrecto.',
        405=>'Valor indicado para Prioridad Incorrecto.',
        437=>'Usuario y/o Password incorrectos.'
    ];

    if(isset($codes[$code])){
        print json_encode(['error'=>true,'info'=>$codes[$code]]);
    }else{
        print json_encode(['error'=>true,'info'=>'Error Desconocido']);
    }
    exit();
}