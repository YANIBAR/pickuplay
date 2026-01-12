import { all, fork } from 'redux-saga/effects';
import todoSaga from './todo';
import authSaga from './auth';

export default function* rootSaga() {
  yield all([fork(authSaga)]);
}
