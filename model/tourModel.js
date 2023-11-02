const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: [true, 'A tour name must be unique'],
      trim: true,
      maxlength: [40, 'A tour name must be lower than 40 chars'],
      minlength: [10, 'A tour name must be more than 10 chars'],
    },
    duration: {
      type: Number,
      required: [true, 'A duration is required'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Must enter the maxium group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Must enter the  difficulty type'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either : easy, medium, difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be more than 1'],
      max: [5, 'rating must be less than 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'TOUR must have price'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        //only works for creating the tour, not for updating
        validator: function (val) {
          return val < this.price;
        },
        message: 'discount need to be lower than price',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'a summary is required'],
    },

    discription: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'a coverimage is required'],
    },

    secretTour: {
      type: Boolean,
      default: false,
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    startDates: [Date],

    slug: [String],

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },

      coordinates: [Number],
      adress: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },

        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//this midleware only work on save(), and create() moogose functions not on update()
// eslint-disable-next-line prefer-arrow-callback
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// eslint-disable-next-line prefer-arrow-callback
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

// eslint-disable-next-line prefer-arrow-callback
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} millisecounds`);
  next();
});

//for removing the secret tour from agregate 'tour-stat'
// eslint-disable-next-line prefer-arrow-callback
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
