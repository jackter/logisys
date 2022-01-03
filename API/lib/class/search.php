<?php

class Search {

    // Remove unnecessary words from the search term and return them as an array
    function filterSearchKeys($query){
        $query = trim(preg_replace("/(\s+)+/", " ", $query));
        $words = array();
        // expand this list with your words.
        $list = array(
            "in",
            "it",
            "a",
            "the",
            "of",
            "or",
            "I",
            "you",
            "he",
            "me",
            "us",
            "they",
            "she",
            "to",
            "but",
            "that",
            "this",
            "those",
            "then",
            "di",
            "dan",
            "yang",
            "ke",
            'ini',
            'itu',
            'ada',
            'jangan',
            'sampai',
            'atas',
            'bawah',
            'kita',
            'kami',
            'dia',
            'mereka',
            'tapi',
            'lalu',
            'aku',
            'saya',
        );
        $c = 0;
        foreach(explode(" ", $query) as $key){
            if (in_array($key, $list)){
                continue;
            }
            $words[] = $key;
            if ($c >= 15){
                break;
            }
            $c++;
        }
        return $words;
    }

    // limit words number of characters
    function limitChars($query, $limit = 200){
        return substr($query, 0,$limit);
    }

    function Create (
        $Q = "",
        $FindIn = array(),
        $Score = array()
    ){

        //=> Check Need
        if(
            empty($Q) || 
            count($FindIn) <= 0
        ){
            return false;   //=> Exit Functions
        }

        $Q = stripslashes($Q);

        //=> Access Database
        // $DB = new DB;
        global $DB;

        //=> Default
        $Keywords = self::filterSearchKeys($Q);
        $Field = array();

        //=> Check Empty Score
        $ScoreEmpty = false;
        if(count($Score) <= 0){
            $ScoreEmpty = true;
        }

        //=> When ScoreEmpty
        if($ScoreEmpty){
            foreach($FindIn AS $Val){

                //=> Create Default Score
                $Score[$Val] = 1;

            }
        }else{
            $iscore = 0;
            foreach($FindIn AS $Val){

                $TheScore = $Score[$iscore];
                if($TheScore < 0){
                    $TheScore = 1;
                }
                $Score[$Val] = $TheScore;

                unset($Score[$iscore]);

                $iscore++;
            }
        }

        /** Match Full */
        if(count($Keywords) > 1){
            foreach($FindIn AS $Val){
                $Field[$Val][] = "
                    IF (
                        $Val LIKE '" . $DB->real_escape_string($Q) . "%', {$Score[$Val]} + 2, 0
                    ) +
                    IF (
                        $Val LIKE '%" . $DB->real_escape_string($Q) . "%', {$Score[$Val]} + 1, 0
                    )
                ";
            }
        }

        /** Matching Keywords */
        foreach($Keywords AS $key){
            foreach($FindIn AS $Val){
                $Field[$Val][] = "
                    IF (
                        $Val LIKE '" . $DB->real_escape_string($key) . "%', {$Score[$Val]} + 2, 0
                    ) +
                    IF (
                        $Val LIKE '%" . $DB->real_escape_string($key) . "%', {$Score[$Val]} + 1, 0
                    )
                ";
            }
        }

        /** Clean Empty Data */
        $count = 0;
        foreach($FindIn AS $Val){
            if(empty($Field[$Val])){
                $Field[$Val] = 0;
                $count++;
            }
        }

        //=> Create Query
        if(sizeof($Field) != $count){
            $Query = "(";
            $QuerySeparator = "";
            foreach($FindIn AS $Val){
                if(!empty($Field[$Val])){
                    $Query .= $QuerySeparator . " (" . implode(" + ", $Field[$Val]) . ") ";
                    $QuerySeparator = "+";
                }
            }
            $Query .= ") AS relevance";

            $return = array(
                'query'     => CLEANHTML($Query),
                'having'    => " HAVING relevance > 0 "
            );

            return $return;
        }

    }

    /**
     * Create Dynamic
     */
    function CreateDyn (
        $Q = "",
        $FindIn = array(),
        $Score = array(),
        $Key = ""
    ){

        //=> Check Need
        if(
            empty($Q) || 
            count($FindIn) <= 0
        ){
            return false;   //=> Exit Functions
        }

        $Q = stripslashes($Q);

        //=> Access Database
        // $DB = new DB;
        global $DB;

        //=> Default
        $Keywords = self::filterSearchKeys($Q);
        $Field = array();

        //=> Check Empty Score
        $ScoreEmpty = false;
        if(count($Score) <= 0){
            $ScoreEmpty = true;
        }

        //=> When ScoreEmpty
        if($ScoreEmpty){
            foreach($FindIn AS $Val){

                //=> Create Default Score
                $Score[$Val] = 1;

            }
        }else{
            $iscore = 0;
            foreach($FindIn AS $Val){

                $TheScore = $Score[$iscore];
                if($TheScore < 0){
                    $TheScore = 1;
                }
                $Score[$Val] = $TheScore;

                unset($Score[$iscore]);

                $iscore++;
            }
        }

        /** Match Full */
        if(count($Keywords) > 1){
            foreach($FindIn AS $Val){
                $Field[$Val][] = "
                    IF (
                        $Val LIKE '" . $DB->real_escape_string($Q) . "%', {$Score[$Val]} + 2, 0
                    ) + 
                    IF (
                        $Val LIKE '%" . $DB->real_escape_string($Q) . "%', {$Score[$Val]} + 1, 0
                    )
                ";
            }
        }

        /** Matching Keywords */
        foreach($Keywords AS $key){
            foreach($FindIn AS $Val){
                $Field[$Val][] = "
                    IF (
                        $Val LIKE '" . $DB->real_escape_string($key) . "%', {$Score[$Val]} + 2, 0
                    ) + 
                    IF (
                        $Val LIKE '%" . $DB->real_escape_string($key) . "%', {$Score[$Val]} + 1, 0
                    )
                ";
            }
        }

        /** Clean Empty Data */
        $count = 0;
        foreach($FindIn AS $Val){
            if(empty($Field[$Val])){
                $Field[$Val] = 0;
                $count++;
            }
        }

        //=> Create Query
        if(sizeof($Field) != $count){
            $Query = "(";
            $QuerySeparator = "";
            foreach($FindIn AS $Val){
                if(!empty($Field[$Val])){
                    $Query .= $QuerySeparator . " (" . implode(" + ", $Field[$Val]) . ") ";
                    $QuerySeparator = "+";
                }
            }
            $Query .= ") AS relevance_$Key";

            $return = array(
                'query'     => CLEANHTML($Query),
                'having'    => " relevance_$Key > 0 ",
                'order'     => " relevance_$Key DESC "
            );

            return $return;
        }

    }
    //=> / END : Create Dynamic

    /*
    function search($query){

        $query = trim($query);
        if (mb_strlen($query)===0){
            // no need for empty search right?
            return false; 
        }
        $query = limitChars($query);

        // Weighing scores
        $scoreFullTitle = 6;
        $scoreTitleKeyword = 5;
        $scoreFullSummary = 5;
        $scoreSummaryKeyword = 4;
        $scoreFullDocument = 4;
        $scoreDocumentKeyword = 3;
        $scoreCategoryKeyword = 2;
        $scoreUrlKeyword = 1;

        $keywords = filterSearchKeys($query);
        $escQuery = DB::escape($query); // see note above to get db object
        $titleSQL = array();
        $sumSQL = array();
        $docSQL = array();
        $categorySQL = array();
        $urlSQL = array();

        /** Matching full occurences **
        if (count($keywords) > 1){
            $titleSQL[] = "if (p_title LIKE '%".$escQuery."%',{$scoreFullTitle},0)";
            $sumSQL[] = "if (p_summary LIKE '%".$escQuery."%',{$scoreFullSummary},0)";
            $docSQL[] = "if (p_content LIKE '%".$escQuery."%',{$scoreFullDocument},0)";
        }

        /** Matching Keywords **
        foreach($keywords as $key){
            $titleSQL[] = "if (p_title LIKE '%".DB::escape($key)."%',{$scoreTitleKeyword},0)";
            $sumSQL[] = "if (p_summary LIKE '%".DB::escape($key)."%',{$scoreSummaryKeyword},0)";
            $docSQL[] = "if (p_content LIKE '%".DB::escape($key)."%',{$scoreDocumentKeyword},0)";
            $urlSQL[] = "if (p_url LIKE '%".DB::escape($key)."%',{$scoreUrlKeyword},0)";
            $categorySQL[] = "if ((
            SELECT count(category.tag_id)
            FROM category
            JOIN post_category ON post_category.tag_id = category.tag_id
            WHERE post_category.post_id = p.post_id
            AND category.name = '".DB::escape($key)."'
                        ) > 0,{$scoreCategoryKeyword},0)";
        }

        // Just incase it's empty, add 0
        if (empty($titleSQL)){
            $titleSQL[] = 0;
        }
        if (empty($sumSQL)){
            $sumSQL[] = 0;
        }
        if (empty($docSQL)){
            $docSQL[] = 0;
        }
        if (empty($urlSQL)){
            $urlSQL[] = 0;
        }
        if (empty($tagSQL)){
            $tagSQL[] = 0;
        }

        $sql = "SELECT p.p_id,p.p_title,p.p_date_published,p.p_url,
                p.p_summary,p.p_content,p.thumbnail,
                (
                    (-- Title score
                    ".implode(" + ", $titleSQL)."
                    )+
                    (-- Summary
                    ".implode(" + ", $sumSQL)." 
                    )+
                    (-- document
                    ".implode(" + ", $docSQL)."
                    )+
                    (-- tag/category
                    ".implode(" + ", $categorySQL)."
                    )+
                    (-- url
                    ".implode(" + ", $urlSQL)."
                    )
                ) as relevance
                FROM post p
                WHERE p.status = 'published'
                HAVING relevance > 0
                ORDER BY relevance DESC,p.page_views DESC
                LIMIT 25";
        $results = DB::query($sql);
        if (!$results){
            return false;
        }
        return $results;
    }*/

}

?>