<?php
    require('connection.php');

    function getSubCats($mysqli){
        $cats = ["games-apk", "videos", "tones", "apps"];
        $dataCat = [];

        foreach($cats as $cat){
            $catCondition = "";

            if($cat === "games-apk"){
                $catCondition = "and(b.sub_category='Action' or b.sub_category='Adventure' or b.sub_category='Arcade' or b.sub_category='Puzzle' or b.sub_category='Simulation' or b.sub_category='Strategy' or b.sub_category='Board')";
            }else if($cat === "videos"){
                $catCondition = "and(b.sub_category='Busty Girls' or b.sub_category='Gravure' or b.sub_category='Latina' or b.sub_category='Plus Size')";
            }else if($cat === "tones"){
                $catCondition = "and(b.sub_category='Children' or sub_category='Funny' or sub_category='Sound-Effects')";
            }else if($cat === "apps"){
                $catCondition = "and(b.sub_category='LifeStyle' or b.sub_category='Productivity' or b.sub_category='Utility' or b.sub_category='Relaxation')";
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
        $query = "SELECT id, title, icon_file_name, content_file_name, content_file_mime FROM cms.portal_content WHERE id!=1 AND category_id = ? AND sub_category_id = ? ORDER BY id DESC LIMIT 20";

        $catId = filter_var($catId, FILTER_SANITIZE_SPECIAL_CHARS);
        $subId = filter_var($subId, FILTER_SANITIZE_SPECIAL_CHARS);

        $stmt = $mysqli->stmt_init();
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

    function getContentData($mysqli, $contentId){
        $contentId = filter_var($contentId, FILTER_SANITIZE_SPECIAL_CHARS);
        $query = "SELECT title, description, icon_file_name, content_file_name FROM cms.portal_content WHERE id = ?";

        $stmt = $mysqli->stmt_init();
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
        getContentData($mysqli, $_POST['contentId']);
    }
?>