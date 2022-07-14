async function getTop10Tokens() {
  const reponse = await fetch("https://api.coinpaprika.com/v1/coins");
  const tokens = await reponse.json();

  return tokens
    .filter((token) => token.rank >= 1 && token.rank <= 10)
    .map((token) => token.symbol);
}

async function getTickerData(tickerList) {
  const response = await fetch("https://api.1inch.io/v4.0/56/tokens");
  const tokens = await response.json();
  const tokenList = Object.values(tokens.tokens);

  return tokenList.filter((token) => tickerList.includes(token.symbol));
}

function renderForm(tokens) {
  const options = tokens.map(
    (token) =>
      `<option value=${token.decimals}-${token.address}>${token.name} (${token.symbol})</option>`
  );

  document.querySelector("[name=from-token]").innerHTML = options;
  document.querySelector("[name=to-token]").innerHTML = options;

  document.querySelector(".js-submit-quote").removeAttribute("disabled");
}

async function formSubmitted(event) {
  event.preventDefault();
  const fromToken = document.querySelector("[name=from-token]").value;
  const toToken = document.querySelector("[name=to-token]").value;
  const [fromDecimals, fromAddress] = fromToken.split("-");
  const [toDecimals, toAddress] = toToken.split("-");
  const fromUnit = 10 ** fromDecimals;
  const decimalsRatio = 10 ** (fromDecimals - toDecimals);

  try {
    const url = `https://api.1inch.io/v4.0/56/quote?fromTokenAddress=${fromAddress}&toTokenAddress=${toAddress}&amount=${fromUnit}`;

    const response = await fetch(url);
    const quote = await response.json();
    const exchange_rate =
      (+quote.toTokenAmount / +quote.fromTokenAmount) * decimalsRatio;
    document.querySelector(".js-quote-container").innerHTML = `
            <p>1 ${quote.fromToken.symbol} = ${exchange_rate} ${quote.toToken.symbol} </p>
            <p>Gas fee: ${quote.estimatedGas}</p>
        `;
  } catch (e) {
    document.querySelector(
      ".js-quote-container"
    ).innerHTML = `The Conversion didn't succeed.`;
  }
}

document
  .querySelector(".js-submit-quote")
  .addEventListener("click", formSubmitted);

getTop10Tokens().then(getTickerData).then(renderForm);
