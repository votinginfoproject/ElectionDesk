<style>
	html { min-width: 0; }
</style>

<section>

	<div id="wait-times">
	
	<h1>Wait Time Calculator</h1>
	
	<?php $i = 1; ?>
	<?php if ($wait_times->success == 1) : foreach ($wait_times->response as $item) : ?>
		<?php if ($i <= 20) : ?>
			<div class="time" style="background: url('https://maps.googleapis.com/maps/api/staticmap?center=<?php echo $item->line1.' '.$item->line2.' '.$item->city.', '.$item->state.' '.$item->zip; ?>&zoom=13&size=600x300&maptype=roadmap&markers=color:red%7Clabel:dot%7C<?php echo $item->latitude; ?>,<?php echo $item->longitude; ?>&sensor=false') no-repeat;">


				<div class="listed-times">
					
					<h2><?php echo $item->locationName; ?></h2>
					
					<?php
						//avg
						if (!isset($item->average_wait_time) ||$item->average_wait_time == NULL) {
							$avg = 'No Data';
						} else {
							$avg = intval($item->average_wait_time / 60).' min';
						}
						
						//max
						if (!isset($item->max_wait_time) ||$item->max_wait_time == NULL) {
							$max = 'No Data';
						} else {
							$max = intval($item->max_wait_time / 60).' min';
						}
						
						//min
						if (!isset($item->min_wait_time) ||$item->min_wait_time == NULL) {
							$min = 'No Data';
						} else {
							$min = intval($item->min_wait_time / 60).' min';
						}
						
					?>
					
					
					<div class="minutes">
						
						<div class="minute current-item"><?php echo $avg; ?></div>
						
					</div>
					
					
					<div class="wait-times">
						<h3 class="average-time"><a class="active time-button" href="#" onClick="return false;" data-value="<?php echo $avg; ?>">Average</a></h3>
						<h3 class="max-time"><a class="time-button" href="#" onClick="return false;" data-value="<?php echo $max; ?>">Max</a></h3>
						<h3 class="min-time"><a class="time-button" href="#" onClick="return false;" data-value="<?php echo $min; ?>">Min</a></h3>
					</div>
					
					
					<div class="bottom-address-info">
						<address>
							<p><?php echo $item->line1; ?></p>
							<?php if (!empty($item->line2)) echo '<p>'.$item->line2.'</p>'; ?>
							<p><?php echo $item->city.', '.$item->state.' '.$item->zip; ?></p>
						</address>
						
							
						<div class="directions">
							<a target="_blank" href="https://www.google.com/maps?q=<?php echo $item->latitude.',%20'.$item->longitude; ?>"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Livello_1" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M50,0C31.294,0,16.129,15.165,16.129,33.87c0,0.401,0.012,0.809,0.03,1.221c0.127,3.558,0.798,6.975,1.939,10.172  C25.324,69.015,50,100,50,100s24.673-30.982,31.9-54.734c1.143-3.197,1.813-6.617,1.939-10.175c0.02-0.412,0.031-0.819,0.031-1.221  C83.871,15.165,68.706,0,50,0z M50,50.459c-9.161,0-16.589-7.428-16.589-16.589c0-9.16,7.428-16.588,16.589-16.588  c9.162,0,16.589,7.428,16.589,16.588C66.589,43.031,59.162,50.459,50,50.459z"/>
							</svg></a>
						</div>
						
					</div>
						
						
				
				</div>
			</div>
				
			
			
	
			
	
			
		<?php endif; ?>	
	<?php $i++; ?>
	<?php endforeach; endif; ?>
	
	</div>
	
</section>

