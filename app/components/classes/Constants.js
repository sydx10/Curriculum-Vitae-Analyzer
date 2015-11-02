var diplomaKeyWords = ["diploma"];
var bachelorKeyWords = ["bachelor's", "bachelor", "bsc", "be"];
var masterKeyWords = ["master", "master's", "mscs", "msc"];
var phdKeyWords = ["phd", "ph.d", "doctorate"];
var durationKeyWords = [
    {
        identifiers: ["year", "years"],
        value: 31536000000
    },
    {
        identifiers: ["months", "month"],
        value: 2629746000
    }];
var workKeyWords = ["work", "experience"];

function Keyword() {
    this.name = "";
    this.value = 0;
}

