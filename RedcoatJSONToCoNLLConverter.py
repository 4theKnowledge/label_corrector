import json
import sys
import os

#returns tags from one document (generally a sentence), as a multiline string
def getTagsInDoc(doc):
    doc_tags = ''
    #doc['tokens'] lists all words in document
    #for each word, go through and find appropriate tag
    for tok_i,token in enumerate(doc['tokens']):
        tag = []
        candidate = []
        #doc['mentions'] represents tag
        #checks each tag to see if it corresponds to current word position
        #assumes extents of mentions are not nested or overlapping
        for mention in doc['mentions']:
            if(tok_i>=mention['start'] and tok_i<mention['end']):
                candidate = mention['labels']
                #selects last tag if there are multiple tags
                #since if all tags are in hierarchy, leaf tag is last
                #Uses BIO-annotation as per Flair Tutorial 6
                if(tok_i==mention['start']):
                    #B if at beginning of chunk
                    tag = 'B-'+candidate[-1]
                else:
                    #
                    tag = 'I-'+candidate[-1]
        #if there is no tag, use O (letter O)
        if candidate==[]:
            tag = 'O'
        #append token, space, tag and newline
        doc_tags+=''.join((token,' ',tag,'\n'))
    return doc_tags

#open a file containing annotations
def getDocsFromFile(fileName):
    docsInFile = []
    with open(fileName) as json_file:
        for line in json_file:
            #each line represents an annotated document
            ann_doc = json.loads(line)
            docsInFile.append(getTagsInDoc(ann_doc))
        return docsInFile

#open all files within a folder, extract json documents within those files
#write documents into train, test and dev set files according to given ratios
#precondition: create a folder (called 'json_in' unless you change method call in main)...
# ... containing all files you want to extract redcoat annotations from
def getFilesOfDocsFromFolder(train_ratio,test_ratio,input_folder):
    trainFile = open('train.txt','x')
    testFile = open('test.txt','x')
    devFile = open('dev.txt','x')
    all_docs = []
    #get docs from all files
    for fileName in os.listdir(input_folder):
        all_docs.extend(getDocsFromFile(input_folder+'/'+fileName))
    #partition out and write docs according to given ratios
    for i,doc in enumerate(all_docs):
        if (i < len(all_docs)*train_ratio):
            trainFile.write(doc+'\n')
        elif (i < len(all_docs)*(train_ratio+test_ratio)):
            testFile.write(doc+'\n')
        else:
            devFile.write(doc+'\n')

if __name__ == "__main__":
    getFilesOfDocsFromFolder(0.8,0.1,'json_in')