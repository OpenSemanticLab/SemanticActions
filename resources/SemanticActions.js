$(document).ready(function () {
    if ($(".actionable_board_action").length === 0) return;

    function normalizeLabel(label) { 
        if (label[0] == "+") label = label.substring(2); 
        label[0] = label[0].toUpperCase;
        return label
    }
    function removeNamespace(label) { return label.replace('Label:', '') }

    //Sets column names as IDs and sets the class for sortable in the column <tbody>. If there is no <tbody> it adds one with id and class.
    $(".actionable_board_action").each((index, element) => {
        $table = $(element);
        var label = removeNamespace($table.attr("id"));

        if ($table.children('tbody').length === 0) {
            $table.append('<tbody></tbody>');
        }

        $table.children('tbody').attr({ id: label, class: "connectedSortable", style: "min-height: 20px; border: 1px solid green;"});
    });

    var oldClass = '';
    var newClass = '';
    var newHref = '/wiki/Label:';
    var newTitle = 'Label:';
    var oldLabel = '';
    var newLabel = '';
    //Sortable with connectWith, remove and receive functions.
    $(".connectedSortable").sortable({
        connectWith: ".connectedSortable",
        //placeholder: "actionable_state_highlight",
        //forcePlaceholderSize: true,
        remove: function (event, ui) {
            //On remove change task number.
            var tasksNumber = parseInt(document.getElementById('Label:' + event.target.id + '_action_number').textContent) - 1;
            document.getElementById('Label:' + event.target.id + '_action_number').textContent = tasksNumber;

            //Remembers old label and old class for the later edits.
            oldLabel = normalizeLabel(document.getElementById('Label:' + event.target.id + '_color').textContent);
            oldClass = document.getElementById('Label:' + event.target.id + '_color').className;
        },

        receive: function (event, ui) {
            //Change class of the task to the new one.
            newClass = document.getElementById('Label:' + event.target.id + '_color').className;
            ui.item[0].getElementsByClassName(oldClass)[0].className = newClass;

            //Change old task attributes with new ones.
            newHref += normalizeLabel(document.getElementById('Label:' + event.target.id + '_color').textContent);
            newTitle += normalizeLabel(document.getElementById('Label:' + event.target.id + '_color').textContent);

            ui.item[0].getElementsByClassName(newClass)[0].children[0].href = newHref;
            ui.item[0].getElementsByClassName(newClass)[0].children[0].title = newTitle;
            ui.item[0].getElementsByClassName(newClass)[0].children[0].innerHTML = normalizeLabel(document.getElementById('Label:' + event.target.id + '_color').textContent);

            newHref = '/wiki/Label:';
            newTitle = 'Label:';

            //On receive change task number.
            var tasksNumber = parseInt(document.getElementById('Label:' + event.target.id + '_action_number').textContent) + 1;
            document.getElementById('Label:' + event.target.id + '_action_number').textContent = tasksNumber;

            //Remembers new label for the later edit.
            newLabel = normalizeLabel(document.getElementById('Label:' + event.target.id + '_color').textContent);

            //Edit task wiki page. Replace old label with the new one.
            fetch("/w/api.php?action=parse&page=" + ui.item[0].children[0].children[1].title + "&prop=wikitext&format=json")
                .then(response => response.json())
                .then(data => {

                    var wikiText = data.parse.wikitext['*'];
                    var newWikiText = wikiText.replace(new RegExp("Label:" + oldLabel, "ig"), "Label:" + newLabel); //case insensitive replacement

                    var params = {
                        action: 'edit',
                        title: '' + ui.item[0].children[0].children[1].title,
                        text: newWikiText,
                        format: 'json'
                    },
                        api = new mw.Api();

                    api.postWithToken('csrf', params).done(function (data) {
                        //console.log(data);
                    });
                });
        }
    }).disableSelection();
});
