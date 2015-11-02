'use strict';

angular.module('myApp.factories')

    .factory('jobDescriptionParser', function (nlp) {

        var findAndParseLocation = function (sentenceArray) {
            var results = [];
            sentenceArray.forEach(
                function (sentence) {
                    if (sentence.toLowerCase().indexOf("location") >= 0 || sentence.toLowerCase().indexOf("country") >= 0) {
                        var tokens = nlp.spot(sentence);
                        results = results.concat(tokens.map(function(token) { return token.analysis.singularize(); } ))
                    }
                }
            )
            return results;
        }


        var findAndParseEducation = function (sentenceArray) {
            //sentenceArray -> each line is one element in the array
            var result = new JobDescriptionEducation();
            sentenceArray.forEach(
                function (sentence) {
                    if (sentence.toLowerCase().indexOf("university") >= 0 || sentence.toLowerCase().indexOf("degree") >= 0 || sentence.toLowerCase().indexOf("diploma") >= 0) {
                        var expectedDegree = categoriseDegree(sentence);
                        //take the min for now
                        result.degree = (expectedDegree != 0 && (result.degree === 0 || expectedDegree < result.degree)) ? expectedDegree : result.degree;
                        result.keywords = getNamedEntitiesWithExistingResults([sentence], result.keywords);
                    }
                }
            )
            return result;
        }

        var findWorkTime = function (sentenceArray) {
            var result = new JobDescriptionWorkExperienceTime();
            sentenceArray.forEach(
                function (sentence) {
                    var singularSentence = sentence.toLowerCase();
                    durationKeyWords.forEach(
                        function (keyWord) {
                            var durationRegex = new RegExp("[\\d] " + keyWord + "[s]?", "g");
                            if (singularSentence.match(durationRegex) &&
                                workKeyWords.some(function (v) {
                                    return singularSentence.match(new RegExp("\\b" + v + "\\b", "i"));
                                })) {
                                result.value = singularSentence.replace(/\D+$/g, "");
                                result.duration = keyWord;
                            }
                        }
                    )
                }
            )
            return result;
        }


        var findLanguages = function (sentenceArray) {
            var result = [];
            sentenceArray.forEach(
                function (sentence) {
                    var singularSentence = sentence.toLowerCase();
                    if (singularSentence.match(new RegExp("\\blanguage[s]?", "g"))) {
                        result = result.concat(singularSentence.split(" "));
                    }
                }
            )
            return result;
        }

        //TODO: REUSED METHOD from lemma.js
        //get keywords
        //returns the keywords with its corresponding number of occurrences
        var getNamedEntitiesWithExistingResults = function(sentenceArray, existingResult) {
            var keyWordNames = [];
            sentenceArray.forEach(
                function (sentence) {
                    var tokens = nlp.spot(sentence);
                    var singularisedTokens = tokens.map(function(token) {
                        return token.analysis.singularize();
                    });
                    Array.prototype.push.apply(keyWordNames,singularisedTokens);
                    //because nlp library will not pick up the word research, which is quite important
                    if (sentence.toLowerCase().indexOf("research") >= 0) {
                        keyWordNames.push("research");
                    }
                }
            );
            //console.log("keywords parsed 1", keyWordNames);
            //store an array of Keyword objects
            for (var i = 0; i < keyWordNames.length; i++) {
                var keyWord = findKeyWord(existingResult, keyWordNames[i]);
                keyWord.name = keyWordNames[i];
                keyWord.value = keyWord.value + 1;
                existingResult.push(keyWord);
            }
            return existingResult;
        }

        var getNamedEntities = function(sentenceArray) {
            return getNamedEntitiesWithExistingResults(sentenceArray, []);
        }

        //for categorising degree in education
        //takes in an array of keywords in degree
        //return to see what degree it is
        //not found: 0, diploma: 1, bachelor: 2, master: 3, phd: 4
        var categoriseDegree = function (keywords) {
            //order is diff, cos we want to consider the min
            var allDegreeKeyWordsArray = [diplomaKeyWords, bachelorKeyWords, masterKeyWords, phdKeyWords];
            for (var i = 0; i < allDegreeKeyWordsArray.length; i++) {
                var degreeKeyWords = allDegreeKeyWordsArray[i];
                for (var j = 0; j < degreeKeyWords.length; j++) {
                    if (keywords.toLowerCase().indexOf(degreeKeyWords[j]) > -1) {
                        //we found keyword, return integer representing degree
                        return i+1;
                    }
                }
            }
            //not specified
            return 0;
        }


        return {
            //use if there is no need to find the word in the phrase
            parse_min_req: getNamedEntities,
            parse_skills: getNamedEntities,
            parse_location: getNamedEntities,
            find_and_parse_location: findAndParseLocation,
            find_and_parse_education: findAndParseEducation,
            find_and_parse_work_time: findWorkTime,
            parse_languages: findLanguages

        }
    }
)
;