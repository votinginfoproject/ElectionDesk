<script type="text/ng-template" id="replyModalContent.html">
  <div class="modal-body">
    <p>Reply from <select name="accounts" id="accountswitcher">
    <?php foreach ($accounts as $account): ?>
      <option value="<?php echo $account->id; ?>"<?php if ($account->is_primary == 1) echo ' selected="selected"' ?>>@<?php echo $account->name; ?></option>
    <?php endforeach; ?>
    </select></p>

    <h2>Reply to <span class="username">@{{ interaction.interaction.author.username }}</span></h2>
    <span class="error"></span>

    <?php
    // Are we logged in
    if(!$this->twitter->is_logged_in()):
    ?>
      <?php echo anchor('/tweet/login', '<img src="'. site_url('assets/img/twitter-connect.png') .'" alt="Login with Twitter" />'); ?>
    <?php
    else:
    ?>
      <form ng-submit="processForm()">
        <p class="alert alert-danger" ng-show="(errorMessage.length > 0)">{{ errorMessage }}</p>

        <div class="form-group">
          <textarea class="form-control" ng-model="twitterMessage" maxlength="140"></textarea>
          <p class="character-count">{{ twitterMessage.length }}/140 characters</p>
        </div>

        <div class="form-group">
          <button class="btn btn-warning" ng-click="cancel()">Cancel</button>
          <input type="submit" class="btn btn-primary" value="Reply">
        </div>
      </form>
    <?php
    endif;
    ?>
    </div>
</script>
