<section id="stream">
<ul>
  <?php
  if (stripos(current_url(), '/bookmarks') !== FALSE):
  ?>
  <li ng-repeat="interaction in interactions | orderByCreated as results" class="entry {{ interaction.interaction.type }}" ng-class="{ bookmarked: interaction.bookmarked }" ng-cloak>
  <?php
  else:
  ?>
  <li ng-repeat="interaction in interactions | sourcefilter:sourceQuery | topicfilter:topicQuery | limitfilter:limitQuery:this.radiusQuery.val | contentfilter:contentQuery | orderByCreated | limitTo:250 as results" class="entry {{ interaction.interaction.type }}" ng-class="{ bookmarked: interaction.bookmarked }" ng-cloak>
  <?php
  endif;
  ?>
    <div ng-switch="interaction.interaction.type">
      <!-- Twitter -->
      <div ng-switch-when="twitter">
        <img ng-src="{{ interaction.twitter.user.profile_image_url_https }}" alt="{{ interaction.twitter.user.name }}" class="profile-picture">
        <i class="fa fa-retweet is-retweet" ng-show="{{ (typeof(interaction.twitter.retweeted_status) !== 'undefined') }}"></i>

        <time class="relative" datetime="{{ (interaction.interaction.created_at.sec * 1000) | date:'yyyy-MM-dd HH:mm:ss' }}"></time>
        <a ng-href="{{ interaction.interaction.link }}" target="_blank" class="target-link">@{{ interaction.interaction.author.username }}</a>
        <p class="summary">{{ interaction.twitter.text }}</p>
        
        <ul class="actions">
          <li class="follow"><a href="#"><i class="fa fa-twitter"></i> Follow</a></li>
          <li class="reply"><a href="#"><i class="fa fa-reply"></i> Reply</a></li>
          <li class="retweet"><a href="#"><i class="fa fa-retweet"></i> Retweet</a></li>
          <li class="bookmark"><a href="" ng-click="bookmark(interaction)"><i class="fa fa-star"></i> Bookmark</a></li>
          <li class="location" ng-if="typeof(interaction.internal.location) !== 'undefined' && typeof(interaction.internal.location.state) != 'undefined' && interaction.internal.location.state.length"><a href="#"><i class="fa fa-map-marker"></i> {{ interaction.internal.location.state }}</a></li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <!-- Facebook -->
      <div ng-switch-when="facebook">
        <img ng-src="https://graph.facebook.com/picture?id={{ interaction.facebook.from.id }}" alt="{{ interaction.facebook.from.name }}" class="profile-picture">
        <time class="relative" datetime="{{ (interaction.interaction.created_at.sec * 1000) | date:'yyyy-MM-dd HH:mm:ss' }}"></time>
        <a ng-href="http://facebook.com/profile.php?id={{ interaction.facebook.from.id }}" target="_blank" class="target-link">{{ interaction.facebook.from.name }}</a>
        <p ng-show="!show" class="summary">{{ (interaction.facebook.message.length > 0) ? interaction.facebook.message : interaction.facebook.story | limitTo:140 }}</p>
        <p ng-show="show" class="full">{{ (interaction.facebook.message.length > 0) ? interaction.facebook.message : interaction.facebook.story }}</p>

        <a href="" class="expand" ng-click="show = !show" ng-show="interaction.facebook.message.length > 140">{{ show ? 'Collapse' : 'Expand' }}</a>
        <ul class="actions">
          <li class="bookmark"><a href="" ng-click="bookmark(interaction)"><i class="fa fa-star"></i> Bookmark</a></li>
          <li class="location" ng-if="typeof(interaction.internal.location) !== 'undefined' && typeof(interaction.internal.location.state) != 'undefined' && interaction.internal.location.state.length"><a href="#"><i class="fa fa-map-marker"></i> {{ interaction.internal.location.state }}</a></li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <!-- Wordpress -->
      <div ng-switch-when="wordpress">
        <img  ng-src="{{ interaction.interaction.author.avatar }}" alt="{{ interaction.interaction.author.name }}" class="profile-picture">
        <time class="relative" datetime="{{ (interaction.interaction.created_at.sec * 1000) | date:'yyyy-MM-dd HH:mm:ss' }}"></time>
        <a ng-href="{{ interaction.interaction.link }}" target="_blank" class="target-link">{{ interaction.interaction.author.name }}</a>
        <p ng-show="!show" class="summary">{{ interaction.interaction.content | limitTo:140 }}</p>
        <p ng-show="show" class="full">{{ interaction.interaction.content }}</p>

        <a href="" class="expand" ng-click="show = !show" ng-show="interaction.interaction.content.length > 140">{{ show ? 'Collapse' : 'Expand' }}</a>
        <ul class="actions">
          <li class="bookmark"><a href="" ng-click="bookmark(interaction)"><i class="fa fa-star"></i> Bookmark</a></li>
          <li class="location" ng-if="typeof(interaction.internal.location) !== 'undefined' && typeof(interaction.internal.location.state) != 'undefined' && interaction.internal.location.state.length"><a href="#"><i class="fa fa-map-marker"></i> {{ interaction.internal.location.state }}</a></li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <div ng-switch-default>Default</div>
    </div>
  </li>
	<li class="ng-repeat" ng-if="results.length == 0">
    No results
	</li>
</ul>
</section>