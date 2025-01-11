<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/searchResall.css">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Castoro&display=swap" rel="stylesheet">
    <title>Search Results</title>
</head>

<?php

    function getDataForExactMatch(){
        try{
            $imageurl = 'https://www.chemrobotics.com/agropat/images/chemical_directory_structures/';
            $cat = $_GET['QueryCat'];
            $query = $_GET['Query'];
            $col_name = "SMILES_CODE";

            switch($cat){
                case "0":
                    $col_name = "SMILES_CODE";
                    break;
                case "1":
                    $col_name = "INCHI";
                    break;
                case "2":
                    $col_name = "INCHIKEY";
                    break;
                case "3":
                    $col_name = "CHEMICAL_NAME";
                    break;
                case "4":
                    $col_name = "IUPAC";
                    break;
                case "5":
                    $col_name = "CAS_RN";
                    break;
                case "6":
                    $col_name = "MOLECULAR_FORMULA";
                    break;
                default:
                    $col_name = "SMILES_CODE";
            }
            
            
            
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
                throw Exception("An Error Occured.");
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

            if(empty(trim($jsonobj->IUPAC))) {
                throw new Exception("Bad Results.");
            }
        

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
        }
        catch(Exception $e){
            echo '<div class="norescnt">';
            echo '<h2>'. " " . $e->getMessage() .'</h2>';
            echo '</div>';
        }

    }



    function getRelatives(){
        try{
            $imageurl = 'https://www.chemrobotics.com/agropat/images/chemical_directory_structures/';
            $cat = $_GET['QueryCat'];
            $query = $_GET['Query'];

            $col_name = "SMILES_CODE";
            $col_name = "SMILES_CODE";

            switch($cat){
                case "0":
                    $col_name = "SMILES_CODE";
                    break;
                case "1":
                    $col_name = "INCHI";
                    break;
                case "2":
                    $col_name = "INCHIKEY";
                    break;
                case "3":
                    $col_name = "CHEMICAL_NAME";
                    break;
                case "4":
                    $col_name = "IUPAC";
                    break;
                case "5":
                    $col_name = "CAS_RN";
                    break;
                case "6":
                    $col_name = "MOLECULAR_FORMULA";
                    break;
                default:
                    $col_name = "SMILES_CODE";
            }
        

            $url = 'https://www.chemrobotics.com/staging/chem_api/getChemicalDirectorySearchLike';
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
                throw Exception("An Error Occured.");
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
            foreach($jsonarr as $jsonobj) { 
                if(empty(trim($jsonobj->IUPAC))) {
                    continue;
                }

                echo '<div onclick="fun1( ' . $jsonobj->ID . ' )" class="card">'; 
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
            }
        }
        catch(Exception $e){
            echo '<div class="norescnt">';
            echo '<h2>'. " " . $e->getMessage() .'</h2>';
            echo '</div>';
        }

    }




?>

<body>

    <div>

        <!-- identity compound -->
        <div id="exactpane" >
            <div class="rescnt">
                <h2>Exact Match</h2>
            </div>
            <?php getDataForExactMatch(); ?>
        </div>

        <!--  related compounds  -->
        <div id="relatedpane">
            <div class="rescnt">
                <h2>Related</h2>
            </div>

            <?php getRelatives(); ?>
        </div>

    </div>
</body>

    <script>
        function fun1(id){
            var form = document.createElement("form");
            form.setAttribute("method", "post");
            form.setAttribute("action", "searchResults.php"); 

            var y = document.createElement("INPUT");
            y.setAttribute("type", "text");
            y.setAttribute("name", "ID"); 
            y.setAttribute("value", id);
            form.appendChild(y);

            document.getElementsByTagName("body")[0].appendChild(form);
            form.submit();
        }

        function placeImageHd(arg){
            arg.src = "image/placehd.png";
        }
    </script>


</html>