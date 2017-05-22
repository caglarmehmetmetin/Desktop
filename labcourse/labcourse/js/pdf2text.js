	
	/**
		* Start Parsing PDF File
		* Open PDF File First   
		* 
	**/
	
		var url = '/labcourse/doc/example.pdf';
		

		// The workerSrc property shall be specified.
		PDFJS.workerSrc = '/labcourse/utils/pdf.js/build/pdf.worker.js';

		PDFJS.getDocument(url).then(
		function (pdf) {
		var pdfDocument = pdf;
		var pagesPromises = [];
			
			for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
				// Required to prevent that i is always the total of pages
				(function (pageNumber) {
					pagesPromises.push(getPageText(pageNumber, pdfDocument));
					
				})(i + 1);
			}

			Promise.all(pagesPromises).then(
			function (pagesText) {
				
				// Remove loading text
				$("#loading-info").remove();
        
				// Render text
				for(var i = 0;i < pagesText.length;i++){
					$("#pdf-text").append("<div id=pdf-text"+ i +" "+"<h3>Page "+ (i + 1) +"</h3><p>"+pagesText[i]+"</p><br></div>")
				}
				
			});
			
			for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
				rendering(i);
			}

		}, function (reason) {
		// PDF loading error
		console.error(reason);
		});


		/**
		* Retrieves the text of a specif page within a PDF Document obtained through pdf.js 
		* 
		* @param {Integer} pageNum Specifies the number of the page 
		* @param {PDFDocument} PDFDocumentInstance The PDF document obtained 
		**/
		function getPageText(pageNum, PDFDocumentInstance) {
			// Return a Promise that is solved once the text of the page is retrieven
			return new Promise(function (resolve, reject) {
			PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
				// The main trick to obtain the text of the PDF page, use the getTextContent method
			
				pdfPage.getTextContent().then(function (textContent) {
					var textItems = textContent.items;
					var finalString = "";
					var myArray = [];

					// Concatenate the string of the item to the final string
					for (var i = 0; i < textItems.length; i++) {
						var item = textItems[i];

						finalString += item.str + " ";
						myArray.push(item.str);
					}

					// Solve promise with the text retrieven from the page
					//console.log(JSON.stringify(myArray))
					
					resolve(finalString);
				});
			});
		});
		}
	
	
	function rendering(pageNum) {
		var result = "pdf-text" + pageNum;
		console.log("result: " + result);
		var temp = $(result).text();
		console.log(temp);
	}
		
	function test() {
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
        }

        PDFJS.getDocument(url).then(function (pdfx) {
            var promises = [], promise;
			
			

            for (i = 1; i < pdfx.numPages; i++) {
                promise = pdfx.getPage(i).then(renderPage);
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
    }
	
	