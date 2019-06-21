var pdfPath = null,
    pdfDoc = null,
    pdfTitle = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    totalPages = null,
    canvas = null,
    ctx = null

var container = document.getElementsByClassName("pdfContainer");

const scale = 1.25


jQuery.fn.exists = function () {
    return this.length > 0;
}


function openPDF(p) {
    pdfPath = p;
    pdfTitle = null;
    console.log("call open pdf")
    displayPDF()
}

function displayPDF() {
    $('#pdfView').replaceWith($('<canvas id="pdfView"></canvas><div id="text-layer" ></div>'))
    $('#prevPage, #nextPage, #page').prop('disabled', false);

    canvas = document.getElementById('pdfView')
    console.log(canvas)
    ctx = canvas.getContext('2d')


    pdfjsLib.getDocument(pdfPath).then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;
        totalPages = pdfDoc.numPages;

        $('#pageCount').html(' of ' + totalPages);
        $('#controls-bar').show();
        $("#page").bind('blur keyup', function (e) {
            e.preventDefault();
            if (e.type == 'blur' || e.keyCode == '13') {
                var p = parseInt($(this).val());
                if (!isNaN(p)) {
                    console.log("renderer page switch")
                    pageNum = p
                    queueRenderPage(pageNum);
                }
            }
        });

        $("form#controls").keypress(function (e) {
            if (e.which == 13)
                return false;
        })

        pageNum = 1

        renderPage(pageNum)


    });

}

function renderPage(num) {
    console.log("enter render")

    pageRendering = true

    pdfDoc.getPage(num).then(function (page) {
        var viewport = page.getViewport(scale);

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        }
        var renderTask = page.render(renderContext)/*.then(function(){
            console.log(page.getTextContent())
            return page.getTextContent()

        }).then(function(textContent){

            var canvas_offset = canvas.offset()

            var canvas_height = canvas_height.get(0).height;
            var canvas_width = canvas.get(0).width;

            $("#text-layer").css({ left: canvas_offset.left + 'px', top: canvas_offset.top + 'px', height: canvas_height + 'px', width: canvas_width + 'px' });
            pdfjsLib.renderTextLayer({
                textContent: textContent,
                container:$('#text-layer').get(0),
                viewport: viewport,
                textDivs: []
            })


        });*/
        console.log(renderTask)
        renderTask.promise.then(function () {
            pageRendering = false;

            if (pageNumPending !== null) {
                renderPage(pageNumPending)
                pageNumPending = null;
            }

            console.log(page.getTextContent())
            return page.getTextContent()
        }).then(function (textContent) {
            console.log(textContent)

            //div.append(textLayerDiv)

            console.log(canvas)
            //console.log(canvas.offset())
            var canvas_offset = $("#pdfView").offset();
            console.log(canvas_offset)

            $("#text-layer").html('');

            $("#text-layer").css({
                left: canvas_offset.left + 'px',
                top: canvas_offset.top + 'px',
                height: canvas.height + 'px',
                width: canvas.width + 'px'
            });
            //console.log(canvas_height,canvas_width)
            //console.log(viewport)
            var renderTextLayerTask = pdfjsLib.renderTextLayer({
                textContent: textContent,
                container: $("#text-layer").get(0),
                viewport: viewport,
                textDivs: []
            });
            if(focusNode){
                console.log("focus",focusNode)
                highlightWords(focusNode)

            }
            return renderTextLayerTask
            //textLayer.setTextContent(textContent);

            // Render text-fragments
            //textLayer.render();
        });
    });

    $("#page").val(num);

    var pageLink = $(".page-link-" + num)
    if (pageLink.exists()) {
        $(".page-link").removeClass("page-link-current");
        pageLink.addClass("page-link-current");

    }
    console.log("finish render")

}

function queueRenderPage(num) {
    console.log("enter queuerenderpage")
    console.log("pr", pageRendering)

    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}


function onPrevPage() {
    if (pdfDoc === null || pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
    highlightConcepts(pageNum)
    if(focusNode){
        $(window).ready(function(){
            highlightWords(focusNode)
        })
    }


}


function onNextPage() {
    if (pdfDoc === null || pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    console.log("click next")
    queueRenderPage(pageNum);
    console.log("after queuerenderpage")

    highlightConcepts(pageNum)

}


$(function () {
    // PDF controls
    $("#prevPage").click(onPrevPage);
    $("#nextPage").click(onNextPage);
    $("#controls-bar").hide();

    // Page navigation
    $("body").keydown(function (e) {
        if ([33, 37, 38].indexOf(e.keyCode) >= 0) { // page up, left, up
            onPrevPage();
        } else if ([34, 39, 40].indexOf(e.keyCode) >= 0) { // page down, right, down
            onNextPage();
        }
    });


    // Open PDF from menu call (or keyboard shortcut)
    //ipc.on('open-pdf', function (event, path) { openPDF(path) })

    $("#createPDFButton").prop("disabled", true);

    // Upon click this should should trigger click on the #file-to-upload file input element
// This is better than showing the not-good-looking file input element
    $("#upload-button").on('click', function () {
        console.log("click button")

        $("#file-to-upload").trigger('click');
        console.log("click button")

    });

// When user chooses a PDF file
    $("#file-to-upload").on('change', function () {
        // Validate whether PDF
        if (['application/pdf'].indexOf($("#file-to-upload").get(0).files[0].type) == -1) {
            alert('Error : Not a PDF');
            return;
        }

        $("#upload-button").hide();

        // Send the object url of the pdf
        openPDF(URL.createObjectURL($("#file-to-upload").get(0).files[0]));
        document.addEventListener('pagechanging', function (e) {
            if (e.pageNumber !== e.previousPageNumber) {
                console.log('page changed from ' + e.previousPageNumber + ' to ' + e.pageNumber);
            }
        });

        drawBubbleGraph(data)
    });


});

function openGraph(evt, graphName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(graphName).style.display = "block";
    evt.currentTarget.className += " active";
}
