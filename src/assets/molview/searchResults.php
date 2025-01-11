<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/searchresult2.css">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab&display=swap" rel="stylesheet">    <title>Document</title>
</head>

<?php

    function getPage(){
        try{
            if($_POST){
                //show compund
                $imageurl = 'https://www.chemrobotics.com/agropat/images/chemical_directory_structures/';

                $query = $_POST['ID'];
                $col_name = "ID";
                $url = 'https://www.chemrobotics.com/staging/chem_api/getChemicalDirectoryExactSearch';
                $data = array('column_name' => $col_name, 'user_text' => $query);

                // use key 'http' even if you send the request to https://...
                $options = array(
                    'http' => array(
                        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                        'method'  => 'POST',
                        'content' => http_build_query($data)
                    )
                );
                set_error_handler(function() { 
                    throw new Exception("An Error Occured.");
                });
                $context  = stream_context_create($options);
                $result = file_get_contents($url, false, $context);
                if ($result === FALSE) { 
                    /* Handle error pop up try again */
                    throw new Exception("No Results Found.");
                }
                
                $resultjsonobj = json_decode($result);

                $resstatus = $resultjsonobj->status;
                $resmessage  = $resultjsonobj->message;

                if(trim($resstatus,' ') != "success"){
                    throw new Exception("No Results Found.");
                }

                $jsonarr = $resultjsonobj->data;
                $jsonobj = $jsonarr[0];

            
                //basic pane
                echo '<div onclick="fun1(' . $jsonobj->ID . ')" class="card">'; 
                echo '<div>';
                echo '<div class="profilecls">';
                echo '<img src=" ' . $imageurl . $jsonobj->CHEMICAL_STRUCTURE . ' "  
                     onerror = "placeImageHd(this)"   
                     alt="Compound Image">';
                echo ' </div>';
                echo '<div class="detcls">';
                echo '<div><span class="cls1">' . $jsonobj->IUPAC  . '</span></div>';
                echo '<div><span class="cls2">ChemSearch ID:</span> <span class="cls3"> ' . $jsonobj->ID . '</span></div>';
                echo '<div><span class="cls2">MF:</span> <span class="cls3" style="display: inline-block;"> ' . $jsonobj->MOLECULAR_FORMULA. "</span>";
                echo '<span class="cls2">MW:</span> <span class="cls3" style="display: inline-block;"> ' . $jsonobj->MOLECULAR_WEIGHT . '</span></div>';
                echo '<div><span class="cls2">IUPAC Name:</span> <span class="cls3"> ' . $jsonobj->IUPAC . '</span></div>';
                echo '<div><span class="cls2">Smiles:</span> <span class="cls3" style="display: inline-block;"> ' . $jsonobj->SMILES_CODE . '</span></div>';
                echo '<div><span class="cls2">InChIKey:</span> <span class="cls3">' . $jsonobj->INCHIKEY . ' </span></div>';
                echo '</div>';
                echo '</div>';
                echo '</div>';


                
                //discription pane
                $ident=[];
                $ident['Chemical Name']=$jsonobj->CHEMICAL_NAME;
                $ident['Description']=$jsonobj->DESCRIPTION;

                echo '<div>';
                echo '<section class="headPane" >';
                echo '<span class="headTitle">Description</span>';
                echo '</section>';
                echo '<div>';
                $keys = array_keys($ident);
                for($i=0;$i<count($keys);$i++){
                    if(empty(trim($ident[$keys[$i]]))){
                        continue;
                    }
                    echo '<section class="elePane">';
                    echo '<span class="eleTitle">'. $keys[$i] .'</span> ';
                    echo '<span class="eleName"> ' . $ident[$keys[$i]] . ' </span>';
                    echo '</section> ';
                }
                echo '</div>';
                echo '</div>';


                //associative of identifier
                $ident=[];
        
                $ident['IUPAC Name']= $jsonobj->IUPAC;
                $ident['InChl']=$jsonobj->INCHI;
                $ident['InChI Key']=$jsonobj->INCHIKEY;
                $ident['Canonical SMILES']=$jsonobj->SMILES_CODE;
                $ident['Molecular Formula']=$jsonobj->MOLECULAR_FORMULA;
                $ident['CAS']=$jsonobj->CAS_RN;
                $ident['European Community (EC) Number']=$jsonobj->EC_NO;
                $ident['UN Number']=$jsonobj->UN_NUMBER;
                $ident['UNII']=$jsonobj->UNII;
                $ident['DSSTox Substance ID']=$jsonobj->DSSTOX_SUBSTANCE_ID;
                $ident['Other Codes']=$jsonobj->OTHER_CODES;

                echo '<div>';
                echo '<section class="headPane" >';
                echo '<span class="headTitle">Names and Identifiers</span>';
                echo '</section>';
                echo '<div>';
                $keys = array_keys($ident);
                for($i=0;$i<count($keys);$i++){
                    if(empty(trim($ident[$keys[$i]]))){
                        continue;
                    }
                    echo '<section class="elePane">';
                    echo '<span class="eleTitle">'. $keys[$i] .'</span> ';
                    echo '<span class="eleName"> ' . $ident[$keys[$i]] . ' </span>';
                    echo '</section> ';
                }
                echo '</div>';
                echo '</div>';
                

                //chemical details table
                $ident=[];
                $ident['Molecular Weight']= $jsonobj->MOLECULAR_WEIGHT;
                $ident['Hydrogen Bond Donor Count']=$jsonobj->HYDROGEN_BOND_DONOR_COUNT;
                $ident['Hydrogen Bond Acceptor Count']=$jsonobj->HYDROGEN_BOND_ACCEPTOR_COUNT;
                $ident['Rotatable Bond Count']=$jsonobj->ROTATABLE_BOND_COUNT;
                $ident['Exact Mass']=$jsonobj->EXACT_MASS;
                $ident['Monoisotopic Mass']=$jsonobj->MONOISOTOPIC_MASS;
                $ident['Topological Polar Surface Area']=$jsonobj->TOPOL_POLAR_SURF_AREA_ANGSTROM;
                $ident['Heavy Atom Count']=$jsonobj->HEAVY_ATOM_COUNT;
                $ident['Formal Charge']=$jsonobj->FORMAL_CHARGE;
                $ident['Complexity']=$jsonobj->COMPLEXITY;
                $ident['Isotope Atom Count']=$jsonobj->ISOTOPE_ATOM_COUNT;
                $ident['Defined Atom Stereocenter Count']=$jsonobj->DEFINED_ATOM_STEREOCNTR_COUNT;
                $ident['Undefined Atom Stereocenter Count']=$jsonobj->UNDEF_ATOM_STEREOCNTR_COUNT;
                $ident['Defined Bond Stereocenter Count']=$jsonobj->DEFINED_BOND_STEREOCNTR_COUNT;
                $ident['Undefined Bond Stereocenter Count']=$jsonobj->UNDEF_BOND_STEREOCNTR_COUNT;
                $ident['Covalently-Bonded Unit Count']=$jsonobj->COVALENTLY_BONDED_UNIT_COUNT;
                $ident['Compound Is Canonicalized']=$jsonobj->COMPOUND_IS_CANONICALIZED;


                function  chnphPropertyInit(){
                    echo '<div>';
                    echo '<section class="headPane" >';
                    echo '<span class="headTitle">Chemical and Physical Properties</span>';
                    echo ' </section>';
                    echo '<section class="elePane">';
                    echo '<table>';
                    echo '<tr>';
                    echo ' <th>Property</th>';
                    echo '<th>Property Value</th>';
                    echo '</tr>';
                }
                
                $chnphpr=0;
                $keys = array_keys($ident);
                for($i=0;$i<count($keys);$i++){
                    if( trim($ident[$keys[$i]])==""){
                        continue;
                    }
                    if($chnphpr==0){
                        $chnphpr=1;
                        chnphPropertyInit();
                    }
                    echo '<tr>';
                    echo '<td>'. $keys[$i] . '</td>';
                    echo '<td>'. $ident[$keys[$i]] . '</td>';
                    echo '</tr>';
                }
                echo '</table>';
                echo '</section>';
                echo '</div>';

                //physical experiment detail
                $ident=[];
                $ident['Physical-Description']= $jsonobj->PHYSICAL_DESCRIPTION;
                $ident['Color-Form']=$jsonobj->COLOR_FORM;
                $ident['Odor']=$jsonobj->SUMRY_PHYSICOCHEM_PROP_EXPERI;
                $ident['Boiling-Point']=$jsonobj->BOILING_POINT;
                $ident['Melting-Point']=$jsonobj->MELTING_POINT;
                $ident['Flash-Point']=$jsonobj->FLASHPOINT;
                $ident['Solubility']=$jsonobj->SOLUBIL_IN_ORGAN_SOLVEN_MGL;
                $ident['Density']=$jsonobj->DENSITY_GML;
                $ident['Vapor-Pressure']=$jsonobj->VAPOUR_PRESSURE;
                $ident['LogP']=$jsonobj->LOGP_COMPUTED;
                $ident['Stability']=$jsonobj->STABILITY;
                $ident['Decomposition']=$jsonobj->DECOMPOSITION;
                $ident['Refractive-Index']=$jsonobj->REFRACTIVE_INDEX;
                $ident['Kovats-Retention-Index']=$jsonobj->KOVATS_RETENTION_INDEX;


                function Expinit(){
                    echo '<div>';
                    echo '<section class="headPane" >';
                    echo '<span class="headTitle">Experimental Properties</span>';
                    echo ' </section>';
                    echo '<section class="elePane">';
                    echo '<table>';
                    echo '<tr>';
                    echo ' <th>Property</th>';
                    echo '<th>Property Value</th>';
                    echo '</tr>';
                }
               
                $exp=0;
                $keys = array_keys($ident);
                for($i=0;$i<count($keys);$i++){
                    if( trim($ident[$keys[$i]])==""){
                        continue;
                    }
                    if($exp==0){
                        $exp=1;
                        Expinit();
                    }
                    echo '<tr>';
                    echo '<td>'. $keys[$i] . '</td>';
                    echo '<td>'. $ident[$keys[$i]] . '</td>';
                    echo '</tr>';
                }
                echo '</table>';
                echo '</section>';
                echo '</div>';


                //information sources
                $ident=[];
                $ident['Information Sources']=$jsonobj->INFORMATION_SOURCES;

                
                $keys = array_keys($ident);
                
                if( trim($ident[$keys[0]])!=""){
                    echo '<div>';
                    echo '<section class="headPane" >';
                    echo '<span class="headTitle">Information Sources</span>';
                    echo '</section>';
                    echo '<div>';
                    echo '<section class="elePane">';
                    echo '<span class="eleTitle">'.  $ident[$keys[0]]  .'</span> ';
                    echo '</section> ';
                    echo '</div>';
                    echo '</div>';
                }
            
            }
            else{
                echo '<div id="errorPane">';
                echo '<h1>404 Page Not Found</h1>';
                echo '<p>The page you requested was not found.</p></div>';
                return;
            }
        }catch(Exception $e){
            echo '<div id="errorPane">';
            echo '<h1>404 Page Not Found</h1>';
            echo '<p> ' . $e->getMessage() . ' </p></div>';
        }
    }

?>


<script>
    function fun1(id){
        console.log(id);
    }

    function placeImageHd(arg){
        arg.src = "image/placehd.png";
    }
</script>

<body>        
    <div>
        <?php  getPage(); ?>

    </div>
</body>

</html>