// tokenize text
// identify tags </> and spans B, I (O isn't used here...)

// Example:
// Remove <B-Activity> studs <B-Item> from G2E7 ( WAP24181 ) OSR
// "doc_idx": 0
// "tokens": ["Remove", "studs", "from", "G2E7", "(", "WAP24181", ")", "OSR"]
// "mentions": [{"start": 0, "end": 1, "labels": ["Activity"]}, {"start": 2, "end": 3, "labels": ["Activity"]}]

const text = "Remove <B-Activity> studs <B-Item> from G2E7 <B-Item> ( <I-Item> WAP24181 <I-Item> ) <I-Item> OSR"

// const text = "Oil <B-Consumable> pressure <B-Attribute> switch <I-Attribute> fault <B-Observation/Observed_state> ."

function flair2iob(text) {
    const tokens = text.split(" ");
    var labelIdx = [];
    var tokenIdx = [];
    // Get positions of labels and tokens
    for (let i=0; i< tokens.length; i++) {
        if (["<B-", "<I-", "<O-"].some(substring=>tokens[i].includes(substring))) {
            labelIdx.push(i);
        } else {
            tokenIdx.push(i);
        }
    }

    // Generate IOB format of input
    var iobText = '';
    tokenIdx.forEach((index) => {
        if (labelIdx.includes(index+1)) {
            let regExp = /(^<+|>$)/g;
            let label = tokens[index+1].replace(regExp, '')
            iobText += tokens[index] + " " + label + "\n";
        } else {
            iobText += tokens[index] + " O\n";
        }
    });
    return iobText
}


function iob2mention(iobText) {
    var text = iobText.split("\n")
    // Temporary filter for empty strings... cant catch where they're coming from...
    text = text.filter(line => line != '')

    // Get text without IOB tags...
    var text_nolabels = [];
    text.forEach(line => 
        text_nolabels.push(line.split(" ")[0])
    )

    console.log(text_nolabels)

    // get index of label positions in iob text array
    var labelIdx = {};
    for (i=0; i < text.length; i++) {
        var currentTag = text[i].split(" ")[1][0]
        if(currentTag == "B") {
            labelIdx[i] = 'B'
        } else if(text[i].split(" ")[1][0] == 'I') {
            labelIdx[i] = 'I'
        } else {
            labelIdx[i] = 'O'
        }
    }

    // Unpack n-gram mentions
    // elimination method
    for (const [index, tag] of Object.entries(labelIdx)) {
        if (tag == 'I' && labelIdx[parseInt(index)+1] == 'I') {
            // remove matched insides
            delete labelIdx[index];
        }
    }

    console.log(labelIdx);

    // build mentions dict
    var tags = Object.values(labelIdx)
    var indices = Object.keys(labelIdx)

    console.log(indices);

    var mentions = [];
    for (i=0; i<indices.length;i++){
        var label = text[i].split("-")[1]
        if (tags[i] == 'B' && tags[i+1] == 'I') {
            mentions.push({"start": parseInt(indices[i]), "end": parseInt(indices[i+1])+1, "labels": label})
        } else if (tags[i] == 'B') {
            mentions.push({"start": parseInt(indices[i]), "end": parseInt(indices[i+1]), "labels": label})
        }
    }

    // compile mention information
    const docIdx = 0
    return {"doc_idx": docIdx, "tokens": text_nolabels, "mentions": mentions}
}

// Convert Flair to IOB
let iobText = flair2iob(text);
// Convert IOB to Mention 
console.log(iob2mention(iobText));