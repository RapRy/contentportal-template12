<?php
    require('connection.php');

    function getSubCats($mysqli){
        $cats = ["apps", "tips", "videos"];
        $dataCat = [];

        foreach($cats as $cat){
            $catCondition = "";

            if($cat === "videos"){
                $catCondition = "and (b.sub_category='Facts and Tips' or b.sub_category='Balance Diet' or b.sub_category='Fitness')";
            }else if($cat === "apps"){
                $catCondition = "and (b.sub_category='Fitness' or b.sub_category='LifeStyle' or b.sub_category='Relaxation')";
            }

            $query = "SELECT a.id, a.category, b.id AS sc_id, b.sub_category FROM cms.categories a, cms.sub_categories b WHERE a.id = b.category_id $catCondition AND category like ?";

            $cat = "{$cat}%";

            $stmt = $mysqli->stmt_init();
            $stmt->prepare($query);
            $bindParam = $stmt->bind_param("s", $cat);
            if($bindParam){
                $stmt->execute();
                $subCat = [];
                $result = $stmt->get_result();
                while($data = $result->fetch_assoc()){
                    $catId = $data['id'];
                    $category = "";
                    $subCatId = $data['sc_id'];
                    $subCategory = $data['sub_category'];

                    if($data['category'] === "Games-apk"){
                        $category = "Games";
                    }else if($data['category'] === "VIDEOS"){
                        $category = "Videos";
                    }else {
                        $category = $data['category'];
                    }

                    $dataAssoc = ["catId" => $catId, "modifiedCategoryName" => $category, "subId" => $subCatId, "subCategory" => $subCategory, "originalCategoryName" => $data['category']];
                    array_push($subCat, $dataAssoc);
                }

                array_push($dataCat, ["main" => $subCat[0]['modifiedCategoryName'], "sub" => $subCat]);
                $stmt->close();
            }
        }
        
        echo json_encode($dataCat);

    }

    function getContents($mysqli, $catId, $subId, $catName, $subName, $originCatName){
        $catId = filter_var($catId, FILTER_SANITIZE_SPECIAL_CHARS);
        $subId = filter_var($subId, FILTER_SANITIZE_SPECIAL_CHARS);

        $stmt = $mysqli->stmt_init();

        if($catName === "Videos"){
            $query = "SELECT id, title, file_name, original_file_name, mime FROM cms.contents WHERE id!=1 and category_id=? AND sub_category_id=? ORDER BY id DESC LIMIT 20";

            $stmt->prepare($query);
            $stmt->bind_param("ii", $catId, $subId);
            $stmt->execute();
            $stmt->store_result();

            $result = $stmt->num_rows();

            $data = [];

            if($result > 0){
                $stmt->bind_result($id, $title, $filename, $origFilename, $mime);
                while($stmt->fetch()){    
                    array_push($data, ["contentId" => $id, "title" => $title, "icon" => pathinfo($filename, PATHINFO_FILENAME), "fileName" => $filename, "category" => $catName, "subCategory" => $subName, "originCataName" => $originCatName]);
                }
            }

            echo json_encode($data);
        }else{
            $query = "SELECT id, title, icon_file_name, content_file_name, content_file_mime FROM cms.portal_content WHERE id!=1 AND category_id = ? AND sub_category_id = ? ORDER BY id DESC LIMIT 20";

            $stmt->prepare($query);
            $stmt->bind_param("ii", $catId, $subId);
            $stmt->execute();
            $stmt->store_result();

            $result = $stmt->num_rows();

            $data = [];

            if($result > 0){
                $stmt->bind_result($id, $title, $iconFileName, $contentFileName, $contentFileMime);
                while($stmt->fetch()){
                    array_push($data, ["contentId" => $id, "title" => $title, "icon" => $iconFileName, "fileName" => $contentFileName, "category" => $catName, "subCategory" => $subName, "originCatName" => $originCatName]);
                }
            }

            echo json_encode($data);
        }

        $stmt->close();
    }

    function getScreenshots($mysqli, $contentId, $ext){
        $stmt = $mysqli->stmt_init();
        $stmt->prepare("SELECT screenshot_file_name FROM cms.portal_content_screenshots WHERE portal_content_id = ?");
        $stmt->bind_param("i", $contentId);
        $stmt->execute();

        $imgCont = [];

        $result = $stmt->get_result();

        while($row = $result->fetch_assoc()){
            array_push($imgCont, $row['screenshot_file_name']);
        }

        $stmt->close();

        return $imgCont;
    }

    function getContentData($mysqli, $contentId, $catName){
        $contentId = filter_var($contentId, FILTER_SANITIZE_SPECIAL_CHARS);
        $catName = filter_var($catName, FILTER_SANITIZE_SPECIAL_CHARS);

        $stmt = $mysqli->stmt_init();

        if($catName === "Videos"){
            $query = "SELECT title, description, file_name, original_file_name FROM cms.contents WHERE id = ?";

            $stmt->prepare($query);
            $stmt->bind_param("i", $contentId);
            $stmt->execute();
            $stmt->store_result();
            $stmt->num_rows();

            $stmt->bind_result($title, $description, $filename, $origFilename);

            $data = [];

            while($stmt->fetch()){
                array_push($data, ["title" => $title, "description" => $description, "icon" => pathinfo($filename, PATHINFO_FILENAME), "filename" => $filename]);
            }

            echo json_encode($data);
        }else{
            $query = "SELECT title, description, icon_file_name, content_file_name FROM cms.portal_content WHERE id = ?";

            $stmt->prepare($query);
            $stmt->bind_param("i", $contentId);
            $stmt->execute();
            $stmt->store_result();
            $stmt->num_rows();

            $stmt->bind_result($title, $description, $iconName, $fileName);

            $data = [];

            while($stmt->fetch()){

                $dataScreen = [];

                $dataAssoc = [
                    "title" => $title,
                    "description" => $description,
                    "icon" => $iconName,
                    "filename" => $fileName
                ];

                $ext = pathinfo($fileName, PATHINFO_EXTENSION);

                if($ext === "apk" || $ext === "xapk"){
                    $screenshots = getScreenshots($mysqli, $contentId, $ext);

                    $dataScreen = ["screenshots" => $screenshots];
                }

                if(!empty($dataScreen)){
                    $merged = array_merge($dataAssoc, $dataScreen);
                    array_push($data, $merged);
                }else{
                    array_push($data, $dataAssoc);
                }
            }

            echo json_encode($data);  
        }

        $stmt->close();
    }

    if(isset($_POST['all'])){
        // $cat = filter_var($_POST['cat'], FILTER_SANITIZE_SPECIAL_CHARS);
        getSubCats($mysqli);
    }

    if(isset($_POST['subId'])){
        getContents($mysqli, $_POST['catId'], $_POST['subId'], $_POST['catName'], $_POST['subName'], $_POST['originCatName']);
    }

    if(isset($_POST['contentId'])){
        getContentData($mysqli, $_POST['contentId'], $_POST['catName']);
    }
?>