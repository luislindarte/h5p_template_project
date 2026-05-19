H5P.FlipCardsChallenge = (function ($, EventDispatcher) {

  function FlipCardsChallenge(params, contentId) {

    EventDispatcher.call(this);

    this.params = params;
    this.contentId = contentId;

    this.score = 0;

    // 9 parejas * 5 puntos
    this.maxScore = 45;

    this.userAnswers = [];

    this.completed = false;

    this.firstCard = null;
    this.secondCard = null;

    this.lockBoard = false;

    this.matchesFound = 0;

    this.totalPairs = 9;
  }

  FlipCardsChallenge.prototype =
    Object.create(EventDispatcher.prototype);

  FlipCardsChallenge.prototype.constructor =
    FlipCardsChallenge;

  FlipCardsChallenge.prototype.attach = function ($container) {

    const self = this;

    self.$container = $container;

    const wrapper = document.createElement('div');
    wrapper.className = 'flipcards-wrapper';

    /*
      SCORE
    */
    const scoreBar = document.createElement('div');

    scoreBar.className = 'flipcards-score';

    scoreBar.innerHTML =
      'Score: <span>0</span>';

    wrapper.appendChild(scoreBar);

    /*
      TABLERO
    */
    const board = document.createElement('div');

    board.className = 'flipcards-board';

    wrapper.appendChild(board);

    /*
      PAREJAS
    */
    const icons = [
      '⭐','⭐',
      '🔥','🔥',
      '🎯','🎯',
      '⚡','⚡',
      '💎','💎',
      '🚀','🚀',
      '🎲','🎲',
      '🧠','🧠',
      '👑','👑'
    ];

    /*
      MEZCLAR
    */
    const shuffled = icons
      .map(value => ({
        value,
        sort: Math.random()
      }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    /*
      CREAR CARTAS
    */
    shuffled.forEach((icon, index) => {

      const card = document.createElement('div');

      card.className = 'flipcard';

      card.dataset.index = index;

      card.dataset.icon = icon;

      card.dataset.flipped = 'false';

      card.dataset.matched = 'false';

      card.innerHTML = `
        <div class="flipcard-inner">

          <div class="flipcard-front"></div>

          <div class="flipcard-back">
            <span>${icon}</span>
          </div>

        </div>
      `;

      /*
        CLICK
      */
      card.addEventListener('click', function () {

        /*
          BLOQUEADO
        */
        if (self.lockBoard) {
          return;
        }

        /*
          YA VOLTEADA
        */
        if (card.dataset.flipped === 'true') {
          return;
        }

        /*
          YA ENCONTRADA
        */
        if (card.dataset.matched === 'true') {
          return;
        }

        /*
          VOLTEAR
        */
        card.dataset.flipped = 'true';

        card.classList.add('flipped');

        /*
          PRIMERA CARTA
        */
        if (!self.firstCard) {

          self.firstCard = card;

          return;
        }

        /*
          SEGUNDA CARTA
        */
        self.secondCard = card;

        self.lockBoard = true;

        const icon1 =
          self.firstCard.dataset.icon;

        const icon2 =
          self.secondCard.dataset.icon;

        const success = icon1 === icon2;

        /*
          COINCIDEN
        */
        if (success) {

          self.score += 5;

          self.firstCard.dataset.matched = 'true';

          self.secondCard.dataset.matched = 'true';

          self.matchesFound++;

          self.userAnswers.push(
            `match:${icon1}|score:${self.score}`
          );

          scoreBar.querySelector('span')
            .innerText = self.score;

          self.resetTurn();

          /*
            TERMINÓ
          */
          if (
            self.matchesFound === self.totalPairs
            && !self.completed
          ) {

            self.completed = true;

            self.finishGame();
          }

          return;
        }

        /*
          NO COINCIDEN
        */
        self.score -= 2;

        /*
          NO BAJAR DE 0
        */
        if (self.score < 0) {
          self.score = 0;
        }

        self.userAnswers.push(
          `fail:${icon1}-${icon2}|score:${self.score}`
        );

        scoreBar.querySelector('span')
          .innerText = self.score;

        /*
          VOLVER A TAPAR
        */
        setTimeout(function () {

          self.firstCard.dataset.flipped = 'false';

          self.secondCard.dataset.flipped = 'false';

          self.firstCard.classList.remove('flipped');

          self.secondCard.classList.remove('flipped');

          self.resetTurn();

        }, 900);

      });

      board.appendChild(card);

    });

    $container.get(0).appendChild(wrapper);
  };

  /*
    RESETEAR TURNO
  */
  FlipCardsChallenge.prototype.resetTurn =
    function () {

      this.firstCard = null;

      this.secondCard = null;

      this.lockBoard = false;
    };

  /*
    FINALIZAR
  */
  FlipCardsChallenge.prototype.finishGame =
    function () {

      const self = this;

      const success =
        self.matchesFound === self.totalPairs;

      const xAPIEvent =
        self.createXAPIEventTemplate(
          'completed'
        );

      const statement =
        xAPIEvent.data.statement;

      xAPIEvent.getVerifiedStatementValue([
        'object',
        'definition'
      ]);

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

  /*
    XAPI
  */
  FlipCardsChallenge.prototype.getXAPIData =
    function () {

      const xAPIEvent =
        this.createXAPIEventTemplate(
          'completed'
        );

      return {
        statement: xAPIEvent.data.statement
      };
    };

  /*
    SCORE
  */
  FlipCardsChallenge.prototype.getScore =
    function () {

      return this.score;
    };

  FlipCardsChallenge.prototype.getMaxScore =
    function () {

      return this.maxScore;
    };

  FlipCardsChallenge.prototype.getAnswerGiven =
    function () {

      return this.completed;
    };

  FlipCardsChallenge.prototype.isPassed =
    function () {

      return this.matchesFound === this.totalPairs;
    };

  return FlipCardsChallenge;

})(H5P.jQuery, H5P.EventDispatcher);