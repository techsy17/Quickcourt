const Facility = require('../models/Facility');
const Court = require('../models/Court');
const Review = require('../models/Review');
const FACILITY_STATUS = require('../constants/facilityStatus');

class FacilityService {
  async getApprovedFacilities({ search, sport, maxPrice, venueType, minRating, page = 1, limit = 9 }) {
    const filter = { status: FACILITY_STATUS.APPROVED };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { location: regex }, { address: regex }];
    }

    if (sport && sport !== 'All') {
      filter.sportsSupported = { $in: [sport] };
    }

    if (venueType && venueType !== 'All') {
      filter.venueType = venueType;
    }

    if (maxPrice && !isNaN(maxPrice)) {
      filter.startingPrice = { $lte: Number(maxPrice) };
    }

    if (minRating && !isNaN(minRating)) {
      filter.rating = { $gte: Number(minRating) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Facility.countDocuments(filter);
    const facilities = await Facility.find(filter)
      .populate('owner', 'name email avatar')
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return {
      facilities,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  async getFacilityById(id) {
    const facility = await Facility.findById(id).populate('owner', 'name email avatar phone');
    if (!facility) {
      throw new Error('Facility not found.');
    }

    const courts = await Court.find({ facility: facility._id, isActive: true });
    const reviews = await Review.find({ facility: facility._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    return {
      facility,
      courts,
      reviews,
    };
  }

  async createFacility(ownerId, data) {
    const facility = await Facility.create({
      owner: ownerId,
      name: data.name,
      location: data.location,
      address: data.address,
      description: data.description,
      aboutVenue: data.aboutVenue || data.description,
      sportsSupported: data.sportsSupported,
      amenities: data.amenities || [],
      photos: data.photos && data.photos.length > 0 ? data.photos : [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80'
      ],
      venueType: data.venueType || 'Indoor',
      startingPrice: data.startingPrice || 500,
      operatingHours: data.operatingHours || { open: '06:00', close: '23:00' },
      status: FACILITY_STATUS.PENDING,
    });

    return facility;
  }

  async updateFacility(facilityId, ownerId, data) {
    const facility = await Facility.findOne({ _id: facilityId, owner: ownerId });
    if (!facility) {
      throw new Error('Facility not found or you are not the authorized owner.');
    }

    const allowedUpdates = [
      'name',
      'location',
      'address',
      'description',
      'aboutVenue',
      'sportsSupported',
      'amenities',
      'photos',
      'venueType',
      'startingPrice',
      'operatingHours',
    ];

    allowedUpdates.forEach((field) => {
      if (data[field] !== undefined) {
        facility[field] = data[field];
      }
    });

    // If critical fields updated, keep or revert to pending if owner re-submits
    if (data.resubmitForApproval) {
      facility.status = FACILITY_STATUS.PENDING;
      facility.approvalComments = '';
    }

    await facility.save();
    return facility;
  }

  async getOwnerFacilities(ownerId) {
    const facilities = await Facility.find({ owner: ownerId }).sort({ createdAt: -1 });
    return facilities;
  }

  async addReview(facilityId, userId, { rating, comment }) {
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      throw new Error('Facility not found.');
    }

    const existingReview = await Review.findOne({ facility: facilityId, user: userId });
    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      await Review.create({
        facility: facilityId,
        user: userId,
        rating: Number(rating),
        comment,
      });
    }

    // Recalculate average rating
    const allReviews = await Review.find({ facility: facilityId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);

    facility.rating = Number(avgRating.toFixed(1));
    facility.reviewCount = allReviews.length;
    await facility.save();

    return { rating: facility.rating, reviewCount: facility.reviewCount };
  }
}

module.exports = new FacilityService();
