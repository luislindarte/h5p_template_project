H5P.FlipCardsChallenge = (function ($, EventDispatcher) {

  function FlipCardsChallenge(params, contentId) {
    EventDispatcher.call(this);

    this.params = params;
    this.contentId = contentId;

    this.score = 0;

    this.maxScore = 27;

    this.userAnswers = [];

    this.completed = false;

    this.cards = [];
  }

  FlipCardsChallenge.prototype = Object.create(EventDispatcher.prototype);
  FlipCardsChallenge.prototype.constructor = FlipCardsChallenge;

  FlipCardsChallenge.prototype.attach = function ($container) {

    const self = this;

    self.$container = $container;

    const wrapper = document.createElement('div');
    wrapper.className = 'flipcards-wrapper';

    const scoreBar = document.createElement('div');
    scoreBar.className = 'flipcards-score';
    scoreBar.innerHTML = 'Score: <span>0</span>';

    wrapper.appendChild(scoreBar);

    const board = document.createElement('div');
    board.className = 'flipcards-board';

    wrapper.appendChild(board);

    const icons = [
      '⭐','🔥','🎯',
      '⚡','💎','🚀',
      '🎲','🧠','👑'
    ];

    const correctCards = [1,3,5,7];

    for(let i = 0; i < 9; i++) {

      const card = document.createElement('div');

      card.className = 'flipcard';

      card.dataset.index = i;

      card.dataset.flipped = 'false';

      card.innerHTML = `
        <div class="flipcard-inner">
          <div class="flipcard-front"></div>
          <div class="flipcard-back">
            <span>${icons[i]}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', function () {

        if(card.dataset.flipped === 'true') {
          return;
        }

        card.dataset.flipped = 'true';

        card.classList.add('flipped');

        const success = correctCards.includes(i);

        if(success) {
          self.score += 3;
        }
        else {
          self.score -= 2;
        }

        self.userAnswers.push(
          `card:${i}|success:${success}|score:${self.score}`
        );

        scoreBar.querySelector('span').innerText = self.score;

        self.cards.push(i);

        if(self.cards.length === 9 && !self.completed) {

          self.completed = true;

          self.finishGame();
        }

      });

      board.appendChild(card);
    }

    $container.get(0).appendChild(wrapper);
  };

  FlipCardsChallenge.prototype.finishGame = function () {

    const self = this;

    const success = self.score > 0;

    const xAPIEvent = self.createXAPIEventTemplate('completed');

    const statement = xAPIEvent.data.statement;

    xAPIEvent.getVerifiedStatementValue(['object', 'definition']);

    xAPIEvent.setScoredResult(
      self.score,
      self.maxScore,
      self,
      true,
      success
    );

    statement.result.response =
      self.userAnswers.join('[,]');

    self.trigger(xAPIEvent);
  };

  FlipCardsChallenge.prototype.getXAPIData = function () {

    const xAPIEvent =
      this.createXAPIEventTemplate('completed');

    return {
      statement: xAPIEvent.data.statement
    };
  };

  FlipCardsChallenge.prototype.getScore = function () {
    return this.score;
  };

  FlipCardsChallenge.prototype.getMaxScore = function () {
    return this.maxScore;
  };

  FlipCardsChallenge.prototype.getAnswerGiven = function () {
    return this.completed;
  };

  FlipCardsChallenge.prototype.isPassed = function () {
    return this.score > 0;
  };

  return FlipCardsChallenge;

})(H5P.jQuery, H5P.EventDispatcher);