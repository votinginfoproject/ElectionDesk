$(function(){
		$('.wait-times h3 a[data-value]').click(function() {
		
			$('.time-button').removeClass('active');
			$(this).addClass('active');
		
			var minute = $(this).attr('data-value');
			var parent = $(this).parent().parent().parent();
			
			parent.find('.minute').html(minute);
		});
	});