// BiteIn:
// @author Jedda Boyle <jeddaboyle@gmail.com>
// @author Taavi Kivisik <taavi.kivisik@gmail.com>

// Define the functions that are going to be inserted into the page's HTML.
// The function switches the element between the word and its translation.
var onTranslationClickVar = function onTranslationClick(element, word, translation) {
    if (element.innerHTML == translation) {
        element.innerHTML = word;
    }
    else {
        element.innerHTML = translation;
    }
};

// Given a word and the translation this function returns the html
// that should be inserted in the place of original english word.
function getTranslationHTML(word, translation){
    var style = " style = '\
                        border-bottom: 1px dotted grey;\
                        cursor: pointer;\
                '"
    var onClick = " onclick = \"return onTranslationClick(this, '" + word + "','" + translation + "');\" "
    return "<span " + style + onClick + ">" + translation + "</span>"
};

// Check if the word between index n and m is in the dictionary of translatable
// words. If it is replace the substring between n and m with the translation
// of the word.
function insertTranslatedWord(str, n, m){
    word = str.substring(n, m)
	translation = words[word];
	if (translation == null){
		return null;
	};
	return str.slice(0, n) + getTranslationHTML(word, translation) + str.slice(m);
};

// Read external JSON file into the words variable.
var words;
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        words = JSON.parse(this.responseText);
    }
};
xhr.open("GET", chrome.extension.getURL('words.json'), false);
xhr.send();

// Insert JavaScript into the webpage's HTML.
var script = document.createElement('script');
script.textContent = onTranslationClickVar;
(document.head||document.documentElement).appendChild(script);

// Main code section:
var bracketBalance;
var indexOfPreviousWordBreak;
var translatedParagraphHTML;
var paragraphs = document.getElementsByTagName("p");

for (paragraph of paragraphs) {
	paragraphHTML = paragraph.innerHTML;
	bracketBalance = 0
	indexOfPreviousWordBreak = 0

	for (var i = 0; i < paragraphHTML.length; i++){
		translatedParagraphHTML = null;
		if (paragraphHTML[i] == '<') {
			translatedParagraphHTML = insertTranslatedWord(paragraphHTML, indexOfPreviousWordBreak, i);
			bracketBalance += 1;
		}
		else if (paragraphHTML[i] == '>') {
			bracketBalance -= 1;
			indexOfPreviousWordBreak = i + 1;
		}
		else if (bracketBalance == 0 && paragraphHTML[i].match(/[a-z]/i) == null) {
				translatedParagraphHTML = insertTranslatedWord(paragraphHTML, indexOfPreviousWordBreak, i);
				indexOfPreviousWordBreak = i + 1;
		}
		if (translatedParagraphHTML != null) {
			paragraphHTML = translatedParagraphHTML;
			step = paragraphHTML.indexOf('/', i);
            if (step != -1) {
                i = step
            }
		}
	}
	paragraph.innerHTML = paragraphHTML;
};
