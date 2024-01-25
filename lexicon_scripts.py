import os

def checkLexiconForDuplicates():
     existing_terms = set()
     terms_with_duplicates = set()
     with open('./lexicons/lexicon-v1') as f:
          for line in f:
                lowercase_line = line.lower()
                tokens = lowercase_line.split()
                term = tokens[0]
                if term in existing_terms:
                     terms_with_duplicates.add(term)
                else:
                     existing_terms.add(term)
     if len(terms_with_duplicates) == 0:
          print("No duplicates in the lexicon!")
     else:
          print("Duplicate Terms in the Lexicon:")
          print(terms_with_duplicates)


