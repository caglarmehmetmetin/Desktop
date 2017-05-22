

    //PDFJS.workerSrc = '';
    PDFJS.disableWorker = true;
    PDFJS.disableRange = true;
    //PDFJS.openExternalLinksInNewWindow = true;
	PDFJS.externalLinkTarget = PDFJS.LinkTarget.BLANK;

    $('.pdf-viewer').each(function() {
        var url = this.getAttribute('data-src');
        var i;
        var container = this;

        var renderPage = function (page) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            container.appendChild(canvas);

            var viewport = page.getViewport(1);
            var scale = (container.offsetWidth - 20) / viewport.width;
            var scaledViewport = page.getViewport(scale);

            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;

            return page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise.then(function () {
                var promise = page.getAnnotations();

                /*
                promise.then(function(annotationsData) {
                    console.log(annotationsData);
                    var newViewport = scaledViewport.clone({
                        dontFlip: true
                    });
                    var annotation = new PDFJS.Annotation({
                        dict: annotationsData
                    });
                });
                */

                return promise;
            });
        };

        PDFJS.getDocument(url).then(function (pdf) {
            var promises = [], promise;

            for (i = 1; i < pdf.numPages; i++) {
                promise = pdf.getPage(i).then(renderPage);
                promises.push(promise);
            }

            Promise.all(promises).then(function (pages) {
                var notes = document.createElement('annotation-notes');
                var items = [];

                pages.forEach(function(annotations) {
                    annotations.forEach(function(annotation) {
                        items.push(annotation);
                    });
                });

                notes.annotations = items; // set all at once so observed
                document.getElementById('notes').appendChild(notes);

                var loading = container.querySelector('.pdf-viewer-loading');
                container.removeChild(loading);
            });
        });
    });
