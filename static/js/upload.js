$(function(){

   var dropbox = $('#dropbox'),
   message = $('.message',dropbox)

   dropbox.filedrop({
       paramname:'file',
       maxfiles:1,
       maxfilesize:5,
       url:'/upload',
       uploadFinished:function(i,file,response){
           $.data(file).addClass('done')
       },
       error: function(err,file){
           switch (err){
               case 'BrowserNotSupported':
                   showMessage('Your browser does not support HTML5 file uploads!');
                   break;
               case 'TooManyFiles':
					alert('Too many files! Please select ' + this.maxfiles + ' at most!');
					break;
               default:
                   break;

           }
       },
       progressUpdated:function(i,file,progress){
           $.data(file).find('.progress').width(progress);
       },
       uploadStrated:function(o,file,len){
         createFile(file);
       }

   });

   var template = '<div class ="preview">'+
       '<span class ="fileHolder">'+
       '<span class ="uploaded"></span>'+
       '</span>'+
       '<div class="progressHolder">'+
							'<div class="progress"></div>'+
						'</div>'+
					'</div>';

   function createFile(file){
       var preview = $(template),
           fileU =$('img',preview);
       var reader = new FileReader();

       reader.onload = function(e){
			fileU.attr('src',e.target.result);
		};

		reader.readAsDataURL(file);

		message.hide();
		preview.appendTo(dropbox);

		$.data(file,preview);
   }
   function showMessage(msg){
		message.html(msg);
	}





});

