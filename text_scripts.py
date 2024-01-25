import os
import string

def formatAllFilesInDirectory(directory):
    files = getFilesFromDirectory(directory)
    full_file_names = [directory + k  for k in files]
    result_file_names = [directory + 'formatted_files/formatted_' + k for k in files]
    for i in range(len(files)):
        formatTextFile(full_file_names[i], result_file_names[i])
    print("Formatted all files in " + directory)


def getFilesFromDirectory(directory):
    files_and_directories = os.listdir(directory)
    files = [k for k in files_and_directories if k.endswith('.txt')]
    return files


def formatTextFile(fileToFormat, resultsFile):
    makeChangesToFileAndSaveToAnotherFile(fileToFormat, resultsFile, lowerCaseAndRemovePunctuationOfText)


def makeChangesToFileAndSaveToAnotherFile(fileToFormat, resultsFile, function):
    with open(fileToFormat) as f:
        contents = f.read()
        results = function(contents)

        with open(resultsFile, "w") as f2:
            f2.write(results)


def lowerCaseAndRemovePunctuationOfText(text):
    lowercase_text = text.lower()
    lowercase_text_sans_punctuation = lowercase_text.translate(str.maketrans('', '', string.punctuation))
    return lowercase_text_sans_punctuation





def getStopWordsList():
    with open('./stop_words_list.txt') as f:
        contents = f.read()
        terms = contents.split(' ')
    return terms


def filterWords(file):
    stop_words = getStopWordsList()
    with open(file) as f:
        contents = f.read()
        tokens = contents.split(' ')
        filtered_words = [word for word in tokens if word not in stop_words]
        # check if words before word in sentiment lexicon is 'not' - if so, flip sign? (multiply score by negative 1?)
