$(document).ready(function () {
    if ($(".actionable_board_action").length === 0) return;
    $.getScript('https://code.jquery.com/ui/1.13.0/jquery-ui.min.js').done(function () {
        function removePlus(label) { if (label[0] == "+") { return label.substring(2); } }
        function removeLabel(label) { return label.replace('Label:', '') }
        var sortIds = '';
        //Sets column names as IDs and sets the class for sortable in the column <tbody>. If there is no <tbody> it adds one with id and class.
        for (var i = 0; i < $(".actionable_board_action").length; i++) {

            var label = removeLabel($(".actionable_board_action").eq(i).attr("id"));

            sortIds += '#' + label + ', ';

            if ($(".actionable_board_action").eq(i).eq(0).children().length === 0) {
                $(".actionable_board_action").eq(i).append('<tbody id=' + label + ' class="connectedSortable"></tbody>');
            }

            $(".actionable_board_action > tbody").eq(i).attr({ id: label, class: "connectedSortable" });
        }

        sortIds = sortIds.slice(0, -2);

        var oldClass = '';
        var newClass = '';
        var newHref = '/wiki/Label:';
        var newTitle = 'Label:';
        var oldLabel = '';
        var newLabel = '';
        //Sortable with connectWith, remove and receive functions.
        $(sortIds).sortable({
            connectWith: ".connectedSortable",

            remove: function (event, ui) {

                //On remove change task number.
                var tasksNumber = parseInt(document.getElementById('Label:' + event.target.id + '_action_number').textContent) - 1;
                document.getElementById('Label:' + event.target.id + '_action_number').textContent = tasksNumber;

                //Remembers old label and old class for the later edits.
                oldLabel = removePlus(document.getElementById('Label:' + event.target.id + '_color').textContent);
                oldClass = document.getElementById('Label:' + event.target.id + '_color').className;


            },

            receive: function (event, ui) {
                //Change class of the task to the new one.
                newClass = document.getElementById('Label:' + event.target.id + '_color').className;
                ui.item[0].getElementsByClassName(oldClass)[0].className = newClass;

                //Change old task attributes with new ones.
                newHref += removePlus(document.getElementById('Label:' + event.target.id + '_color').textContent);
                newTitle += removePlus(document.getElementById('Label:' + event.target.id + '_color').textContent);

                ui.item[0].getElementsByClassName(newClass)[0].children[0].href = newHref;
                ui.item[0].getElementsByClassName(newClass)[0].children[0].title = newTitle;
                ui.item[0].getElementsByClassName(newClass)[0].children[0].innerHTML = removePlus(document.getElementById('Label:' + event.target.id + '_color').textContent);

                newHref = '/wiki/Label:';
                newTitle = 'Label:';

                //On receive change task number.
                var tasksNumber = parseInt(document.getElementById('Label:' + event.target.id + '_action_number').textContent) + 1;
                document.getElementById('Label:' + event.target.id + '_action_number').textContent = tasksNumber;

                //Remembers new label for the later edit.
                newLabel = removePlus(document.getElementById('Label:' + event.target.id + '_color').textContent);

                //Edit task wiki page. Replace old label with the new one.
                fetch("/w/api.php?action=parse&page=" + ui.item[0].children[0].children[1].title + "&prop=wikitext&format=json")
                    .then(response => response.json())
                    .then(data => {

                        var wikiText = data.parse.wikitext['*'];
                        var newWikiText = wikiText.replace("Label:" + oldLabel, "Label:" + newLabel);

                        var params = {
                            action: 'edit',
                            title: '' + ui.item[0].children[0].children[1].title,
                            text: newWikiText,
                            format: 'json'
                        },
                            api = new mw.Api();

                        api.postWithToken('csrf', params).done(function (data) {
                            console.log(data);
                        });
                    });
            }
        }).disableSelection();
    });
});