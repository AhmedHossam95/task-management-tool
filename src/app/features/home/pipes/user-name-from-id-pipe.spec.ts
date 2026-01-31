import { UserNameFromIdPipe } from './user-name-from-id-pipe';

describe('UserNameFromIdPipe', () => {
  it('create an instance', () => {
    const pipe = new UserNameFromIdPipe();
    expect(pipe).toBeTruthy();
  });
});
