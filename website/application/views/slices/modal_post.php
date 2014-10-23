<div id="postModal" class="modal fade" tabindex="-1" role="dialog" ng-controller="PostController" modal-shown>
  <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-top"></div>
        <div class="modal-body">
          <ul class="nav nav-tabs" role="tablist">
            <li class="active"><a href="#postTwitterTab" role="tab" data-toggle="tab">Twitter</a></li>
            <li><a href="#postFacebookTab" role="tab" data-toggle="tab">Facebook</a></li>
          </ul>

          <div class="tab-content">
            <div class="tab-pane active" id="postTwitterTab">
              <?php
              // Are we logged in
              if(!$this->twitter->is_logged_in()):
              ?>
                <?php echo anchor('/tweet/login', '<img src="'. site_url('assets/img/twitter-connect.png') .'" alt="Login with Twitter" />'); ?>
              <?php
              else:
              ?>
                <p class="from">Post from</p>
                <select name="accounts" id="accountswitcher" class="form-control" ng-model="twitterAccountSelected" ng-options="account.id as account.name for account in twitterAccounts">
                  <option value="">Select account</option>
                </select>

                <form ng-submit="processTwitterForm()">
                  <p class="alert alert-danger" ng-show="(twitterErrorMessage.length > 0)">{{ twitterErrorMessage }}</p>

                  <div class="form-group">
                    <textarea class="form-control" ng-model="twitterPostContent" maxlength="140"></textarea>
                    <p class="character-count">{{ twitterPostContent.length }}/140 characters</p>
                  </div>

                  <div class="form-group button-wrapper">
                    <input type="submit" class="btn btn-primary" value="Post">
                  </div>
                </form>
                <div class="clearfix"></div>
              <?php
              endif;
              ?>
            </div>
            <div class="tab-pane" id="postFacebookTab">
              <p class="from">Post to</p>
              <select name="accounts" id="accountswitcher" class="form-control" ng-model="facebookPageSelected" ng-options="page.id as page.name for page in facebookPages">
                <option value="">Select page</option>
              </select>
              <form ng-submit="processFacebookForm()">
                <p class="alert alert-danger" ng-show="(facebookErrorMessage.length > 0)">{{ facebookErrorMessage }}</p>

                <div class="form-group">
                  <textarea class="form-control" ng-model="facebookPostContent" maxlength="140"></textarea>
                </div>

                <div class="form-group button-wrapper">
                  <input type="submit" class="btn btn-primary" value="Post">
                </div>
              </form>
              <div class="clearfix"></div>
            </div>
          </div>
      </div>
      <div class="modal-bottom"></div>
    </div>
  </div>
</div>