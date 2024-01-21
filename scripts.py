import os

def checkLexiconForDuplicates():
    with open('./lexicons/lexicon-v1') as f:
        existing_terms = set()
        for line in f:
                lowercase_line = line.lower() 
                tokens = lowercase_line.split()
                term = tokens[0]
                if term in existing_terms:
                     print(term)
                else:
                     existing_terms.add(term)


