<?php

    try{

        $smiles = $_POST['query'];

        $form_data = array('smiles' => $smiles);

        $data = http_build_query($form_data);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://www.chemspider.com/InChI.asmx/SMILESToInChI");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $out = curl_exec($ch);

        curl_close($ch);

        echo $out;

    }catch(Exception $e){
        echo $e->getMessage();
    }

?>