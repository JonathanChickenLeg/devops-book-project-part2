class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.role = "user";
  }
}
module.exports = { User };