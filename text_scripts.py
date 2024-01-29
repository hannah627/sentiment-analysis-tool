import os
import string


def makeChangesToFileAndSaveToAnotherFile(fileToFormat, resultsFile, function):
    with open(fileToFormat) as f:
        contents = f.read()
        results = function(contents)

        with open(resultsFile, "w") as f2:
            f2.write(results)


# def formatAllFilesInDirectory(directory):
#     files = getFilesFromDirectory(directory)
#     full_file_names = [directory + k  for k in files]
#     result_file_names = [directory + 'formatted_files/formatted_' + k for k in files]
#     for i in range(len(files)):
#         formatTextFile(full_file_names[i], result_file_names[i])
#     print("Formatted all files in " + directory)


def applyFunctionToAllFilesInDirectory(startingDirectory, resultsDirectory, function):
    files = getFilesFromDirectory(startingDirectory)
    full_file_names = [startingDirectory + k  for k in files]
    result_file_names = [resultsDirectory + k for k in files]
    for i in range(len(files)):
        function(full_file_names[i], result_file_names[i])

def getFilesFromDirectory(directory):
    files_and_directories = os.listdir(directory)
    files = [k for k in files_and_directories if k.endswith('.txt')]
    return files



def formatAllFilesInDirectory(directory):
    resultsDirectory = directory + 'formatted_files/formatted_'
    applyFunctionToAllFilesInDirectory(directory, resultsDirectory, formatTextFile)
    print("Formatted all files in " + directory)


def formatTextFile(fileToFormat, resultsFile):
    makeChangesToFileAndSaveToAnotherFile(fileToFormat, resultsFile, lowerCaseAndRemovePunctuationOfText)


def lowerCaseAndRemovePunctuationOfText(text):
    lowercase_text = text.lower()
    lowercase_text_sans_punctuation = lowercase_text.translate(str.maketrans('', '', string.punctuation))
    return lowercase_text_sans_punctuation



def getStopWordsList():
    with open('./stop_words_list.txt') as f:
        contents = f.read()
        terms = contents.split('\n')
    return terms


def applyStopWordsToDirectory(directory):
    resultsDirectory = directory + 'formatted_files_without_stopwords/'
    applyFunctionToAllFilesInDirectory(directory, resultsDirectory, applyStopWords)


def applyStopWords(fileToFilter, resultsFile):
    makeChangesToFileAndSaveToAnotherFile(fileToFilter, resultsFile, filteringWords)
    # check if words before word in sentiment lexicon is 'not' - if so, flip sign? (multiply score by negative 1?)


def filteringWords(text):
    stop_words = getStopWordsList()
    tokens_with_newline_chars = text.split(' ')
    rejoined_tokens = '\n'.join(tokens_with_newline_chars)
    clean_tokens = rejoined_tokens.split('\n')
    filtered_words = [word for word in clean_tokens if word not in stop_words]
    results = ' '.join(filtered_words)
    return results
