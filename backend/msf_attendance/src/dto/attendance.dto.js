class CheckInDto {
  constructor({ photo }) {
    this.photo = photo;
  }
}

class CheckOutDto {
  constructor({ photo }) {
    this.photo = photo;
  }
}

module.exports = { CheckInDto, CheckOutDto };
