import mean from 'ramda/src/mean.js'

export const percentIncrease = (a, b) => {
  let percent
  if(b !== 0) {
    if(a !== 0) {
      percent = (b - a) / a * 100
    } else {
      percent = b * 100
    }
  } else {
    percent = - a * 100
  }
  return Math.floor(percent)
}

export const covariance = (X, Y) => {
  if (X.length !== Y.length) {
    throw Error('X.length must match Y.length')
  }

  const length = X.length
  const meanX = mean(X)
  const meanY = mean(Y)

  let covariance = 0

  for (let i = 0; i < length; i++) {
    covariance += (X[i] - meanX) * (Y[i] - meanY)
  }

  return covariance / length
}

export const variance = values => {
  const average = mean(values)

  function sum(a, b) {
    const diff = b - average
    return a + (diff * diff)
  }

  return values.reduce(sum, 0) / values.length
}
