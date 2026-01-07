# Sentiment Analysis Tool

This repository contains a web-based tool for performing sentiment analysis with custom and existing lexicons; understanding how and why certain scores were reached; and editing those scores as needed.

## Live tool
You can access the live version of the tool here: **[Sentiment Analysis Tool](https://hannah627.github.io/sentiment-analysis-tool/)**

## Features
* **Score text with sentiment lexicons**
    * Choose one or more lexicons (e.g., AFINN, Historical Lexicon, or your own custom lexicon).
    * Paste text or upload file(s) to score.
    * Review **document-level scores** and **token-level results**, plus a **full-text view** with scored words highlighted.
* **Understand “why” a score happened**
    * Hover over highlighted words in the full text to see the word’s score and which lexicon it came from.
    * Compare the quantity of positive vs negative scored terms and the distribution of scores, as a graph or as a table.
* **Customize scoring to match your domain**
    * Download the provided **template lexicon CSV**, add words + scores, upload it as a **custom lexicon**, and re-run.
    * Download the **template stop-words TXT**, add words you want excluded, upload it, and re-run.
* **Edit and override existing lexicons**
    * If a term appears in multiple lexicons, the tool applies scores in a **cascading** manner: the **latest** lexicon (in the tool’s ordering) that contains the term “wins”. This makes it easy to “override” a default score using a custom lexicon.
* **Real-time Results**: A list of newly scored terms is generated in real-time in the `term,score` CSV format.
* **Client-Side Processing**: All operations are handled in the browser using JavaScript. No data is sent to a server.

## How to Use
1.  **Navigate to the Tool**: Open the [Sentiment Analysis Tool](https://hannah627.github.io/sentiment-analysis-tool/) in your web browser.
2.  **Choose Your Input**: In the "Input" section, click "Choose File" and select your text file(s), or simply begin typing or copy and paste in text to the textbox.
3. **See Your Results** As soon as any text is entered, or one or more files is uploaded, the "Results" section will appear
    * The **Summary** section will show the text's Comparative Score (scored words vs length of text), Total Score (the sum of all scored words), the number of scored tokens, and the total number of tokens.
    * The **Scored Terms** section will display the distribution of scores, initially as a histogram, but also available as a table. Beneath that, a table displays each scored term, its score, and which lexicon the term and score came from, allowing easy comparison between positive and negative terms and a quick overview of which lexicon(s) were most relevant.
    * The **Full Text** section will show the full text with each scored term underlined, bolded, and colored red. Hovering over any scored term will show what score the term received and which lexicon the score came from. This provides an overview of scores in context.

##  Background

Created by **Hannah Burrows** as part of a **University of Washington capstone project (Winter & Spring 2024).**

## License

**Creative Commons Attribution 4.0 International (CC BY 4.0)**

If you publish or reuse this project, please provide attribution to the original author.