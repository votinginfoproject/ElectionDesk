<section id="stream">
<ul>
  <?php
  if (stripos(current_url(), '/bookmarks') !== FALSE):
  ?>
  <li ng-repeat="interaction in interactions | orderByCreated | bookmarked as results" class="entry {{ interaction.interaction.type }}" ng-class="{ bookmarked: interaction.bookmarked }" ng-cloak>
  <?php
  else:
  ?>
  <li ng-repeat="interaction in interactions | sourcefilter:sourceQuery | topicfilter:topicQuery | limitfilter:limitQuery:this.radiusQuery.val | contentfilter:contentQuery | orderByCreated | limitTo:100 as results" class="entry {{ interaction.interaction.type }}" ng-class="{ bookmarked: interaction.bookmarked }" ng-cloak>
  <?php
  endif;
  ?>
    <div ng-switch="interaction.interaction.type">
      <!-- Twitter -->
      <div ng-switch-when="twitter">
        <img ng-src="{{ interaction.interaction.author.avatar }}" alt="{{ interaction.twitter.user.name }}" class="profile-picture">
        <i class="fa fa-retweet is-retweet" ng-show="{{ interaction.twitter.retweet }}"></i>
        <time class="relative" datetime="{{ (interaction.interaction.created_at.sec * 1000) | date:'yyyy-MM-dd HH:mm:ss' }}"></time>
        <a ng-href="{{ interaction.interaction.link }}" target="_blank" class="target-link">@{{ interaction.interaction.author.username }}</a>
        <p class="summary" ng-bind-html="interaction.interaction.content | linkify:twitter"></p>
        
        <ul class="actions">
          <li class="follow"><a href="" ng-click="follow(interaction)"><i class="fa fa-twitter"></i> Follow</a></li>
          <li class="reply"><a href="" ng-click="reply(interaction)"><i class="fa fa-reply"></i> Reply</a></li>
          <li class="retweet"><a href="" ng-click="retweet(interaction)"><i class="fa fa-retweet"></i> Retweet</a></li>
          <li class="bookmark"><a href="" ng-click="bookmark(interaction)"><i class="fa fa-star"></i> Bookmark</a></li>
          <li class="location" ng-if="typeof(interaction.internal.location) !== 'undefined' && typeof(interaction.internal.location.state) != 'undefined' && interaction.internal.location.state.length"><a href="https://maps.google.com?ll={{ interaction.internal.location.coords[1] }},{{ interaction.internal.location.coords[0] }}"><i class="fa fa-map-marker"></i> {{ interaction.internal.location.state }}</a></li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <!-- Facebook -->
      <div ng-switch-when="facebook">
        <img ng-src="https://graph.facebook.com/picture?id={{ interaction.facebook.from.id }}" alt="{{ interaction.facebook.from.name }}" class="profile-picture">
        <time class="relative" datetime="{{ (interaction.interaction.created_at.sec * 1000) | date:'yyyy-MM-dd HH:mm:ss' }}"></time>
        <a ng-href="http://facebook.com/profile.php?id={{ interaction.facebook.from.id }}" target="_blank" class="target-link">{{ interaction.facebook.from.name }}</a>
        <p ng-show="!show" class="summary" ng-bind-html="interaction.interaction.content | summarify | linkify"></p>
        <p ng-show="show" class="full" ng-bind-html="interaction.interaction.content | linkify"></p>

        <a href="" class="expand" ng-click="show = !show" ng-show="interaction.interaction.content > 140">{{ show ? 'Collapse' : 'Expand' }}</a>
        <ul class="actions">
          <li class="bookmark"><a href="" ng-click="bookmark(interaction)"><i class="fa fa-star"></i> Bookmark</a></li>
          <li class="location" ng-if="typeof(interaction.internal.location) !== 'undefined' && typeof(interaction.internal.location.state) != 'undefined' && interaction.internal.location.state.length"><a href="https://maps.google.com?ll={{ interaction.internal.location.coords[1] }},{{ interaction.internal.location.coords[0] }}"><i class="fa fa-map-marker"></i> {{ interaction.internal.location.state }}</a></li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <!-- Wordpress -->
      <div ng-switch-when="wordpress">
        <img ng-src="{{ interaction.interaction.author.avatar }}" alt="{{ interaction.interaction.author.name }}" class="profile-picture">
        <time class="relative" datetime="{{ (interaction.interaction.created_at.sec * 1000) | date:'yyyy-MM-dd HH:mm:ss' }}"></time>
        <a ng-href="{{ interaction.interaction.link }}" target="_blank" class="target-link">{{ interaction.interaction.author.name }}</a>
        <p ng-show="!show" class="summary" ng-bind-html="interaction.interaction.content | summarify | linkify"></p>
        <p ng-show="show" class="full" ng-bind-html="interaction.interaction.content | linkify"></p>

        <a href="" class="expand" ng-click="show = !show" ng-show="interaction.interaction.content.length > 140">{{ show ? 'Collapse' : 'Expand' }}</a>
        <ul class="actions">
          <li class="bookmark"><a href="" ng-click="bookmark(interaction)"><i class="fa fa-star"></i> Bookmark</a></li>
          <li class="location" ng-if="typeof(interaction.internal.location) !== 'undefined' && typeof(interaction.internal.location.state) != 'undefined' && interaction.internal.location.state.length"><a href="https://maps.google.com?ll={{ interaction.internal.location.coords[1] }},{{ interaction.internal.location.coords[0] }}"><i class="fa fa-map-marker"></i> {{ interaction.internal.location.state }}</a></li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <!-- Disqus -->
      <div ng-switch-when="disqus">
        <a href="http://disqus.com" target="_blank"><img src="/assets/img/disqus.png" alt="{{ interaction.interaction.author.name }}" class="profile-picture"></a>
        <a ng-href="{{ interaction.interaction.link }}" target="_blank"><time class="relative" datetime="{{ (interaction.interaction.created_at.sec * 1000) | date:'yyyy-MM-dd HH:mm:ss' }}"></time></a>
        <a ng-href="https://disqus.com/home/user/{{ interaction.interaction.author.username }}" target="_blank" class="target-link">{{ interaction.interaction.author.name }}</a>
        <p ng-show="!show" class="summary" ng-bind-html="interaction.interaction.content | summarify | linkify"></p>
        <p ng-show="show" class="full" ng-bind-html="interaction.interaction.content | linkify"></p>

        <a href="" class="expand" ng-click="show = !show" ng-show="interaction.interaction.content.length > 140">{{ show ? 'Collapse' : 'Expand' }}</a>
        <ul class="actions">
          <li class="bookmark"><a href="" ng-click="bookmark(interaction)"><i class="fa fa-star"></i> Bookmark</a></li>
          <li class="location" ng-if="typeof(interaction.internal.location) !== 'undefined' && typeof(interaction.internal.location.state) != 'undefined' && interaction.internal.location.state.length"><a href="https://maps.google.com?ll={{ interaction.internal.location.coords[1] }},{{ interaction.internal.location.coords[0] }}"><i class="fa fa-map-marker"></i> {{ interaction.internal.location.state }}</a></li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <!-- Google+ -->
      <div ng-switch-when="googleplus">
        <img ng-src="{{ interaction.interaction.author.avatar }}" alt="{{ interaction.interaction.author.name }}" class="profile-picture">
        <time class="relative" datetime="{{ (interaction.interaction.created_at.sec * 1000) | date:'yyyy-MM-dd HH:mm:ss' }}"></time>
        <a ng-href="{{ interaction.interaction.link }}" target="_blank" class="target-link">{{ interaction.interaction.author.name }}</a>
        <p ng-show="!show" class="summary" ng-bind-html="interaction.interaction.content | summarify | linkify"></p>
        <p ng-show="show" class="full" ng-bind-html="interaction.interaction.content | linkify"></p>

        <a href="" class="expand" ng-click="show = !show" ng-show="interaction.interaction.content.length > 140">{{ show ? 'Collapse' : 'Expand' }}</a>
        <ul class="actions">
          <li class="bookmark"><a href="" ng-click="bookmark(interaction)"><i class="fa fa-star"></i> Bookmark</a></li>
          <li class="location" ng-if="typeof(interaction.internal.location) !== 'undefined' && typeof(interaction.internal.location.state) != 'undefined' && interaction.internal.location.state.length"><a href="https://maps.google.com?ll={{ interaction.internal.location.coords[1] }},{{ interaction.internal.location.coords[0] }}"><i class="fa fa-map-marker"></i> {{ interaction.internal.location.state }}</a></li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <!-- Default -->
      <div ng-switch-default>Unknown interaction type: {{ interaction.interaction.type }}</div>
    </div>
  </li>
	<li class="ng-repeat" ng-if="doneLoading && results.length == 0" ng-cloak>
    <?php
    if (stripos(current_url(), '/bookmarks') !== FALSE):
    ?>
    <h3><i class="fa fa-question-circle"></i> No bookmarks found</h3>
    <p>You haven't bookmarked any interactions yet.</p>
    <p>Create a new bookmark by clicking the "Bookmark" link for any interaction in the feed.</p>
    <?php
    else:
    ?>
  <h3><i class="fa fa-question-circle"></i> No results</h3>
    <p>Please make your filters less restrictive.</p>
    <?php
    endif;
    ?>
  </li>
  <li class="ng-repeat" ng-if="!doneLoading" ng-cloak>
    <h1><i class="fa fa-spin fa-circle-o-notch"></i> Loading...</h1>
  </li>
</ul>
</section>