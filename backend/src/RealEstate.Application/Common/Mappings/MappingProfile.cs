using AutoMapper;
using RealEstate.Application.Features.Admin.Dtos;
using RealEstate.Application.Features.Agencies.Dtos;
using RealEstate.Application.Features.Agents.Dtos;
using RealEstate.Application.Features.Contact.Dtos;
using RealEstate.Application.Features.Inquiries.Dtos;
using RealEstate.Application.Features.Properties.Dtos;
using RealEstate.Application.Features.Reviews.Dtos;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Property, PropertyDto>()
            .ForMember(d => d.AgentName, opt => opt.MapFrom(s => s.Agent.FullName))
            .ForMember(d => d.AgencyName, opt => opt.MapFrom(s => s.Agency != null ? s.Agency.Name : null));

        CreateMap<PropertyImage, PropertyImageDto>();

        CreateMap<Inquiry, InquiryDto>()
            .ForMember(d => d.PropertyTitle, opt => opt.MapFrom(s => s.Property.Title));

        CreateMap<User, AgentDto>()
            .ForMember(d => d.AgencyName, opt => opt.MapFrom(s => s.Agency != null ? s.Agency.Name : null))
            .ForMember(d => d.ListingCount, opt => opt.MapFrom(s => s.Listings.Count))
            .ForMember(d => d.ReviewCount, opt => opt.MapFrom(s => s.ReceivedReviews.Count))
            // Casting to (double?) before Average() is the standard trick for "average of
            // possibly-empty collection" — Average() on a nullable sequence returns null for
            // an empty sequence instead of throwing, so no separate Any()-guarded ternary needed.
            .ForMember(d => d.AverageRating, opt => opt.MapFrom(s => s.ReceivedReviews.Select(r => (double?)r.Rating).Average()));

        CreateMap<Review, ReviewDto>()
            .ForMember(d => d.ReviewerName, opt => opt.MapFrom(s => s.Reviewer.FullName))
            .ForMember(d => d.ReviewerAvatarUrl, opt => opt.MapFrom(s => s.Reviewer.AvatarUrl));

        CreateMap<Agency, AgencyDto>()
            .ForMember(d => d.AgentCount, opt => opt.MapFrom(s => s.Agents.Count))
            .ForMember(d => d.ListingCount, opt => opt.MapFrom(s => s.Listings.Count));

        CreateMap<Agency, AgencyDetailDto>()
            .IncludeBase<Agency, AgencyDto>()
            .ForMember(d => d.Agents, opt => opt.MapFrom(s => s.Agents));

        CreateMap<AgencyJoinRequest, AgencyJoinRequestDto>()
            .ForMember(d => d.AgencyName, opt => opt.MapFrom(s => s.Agency.Name))
            .ForMember(d => d.UserName, opt => opt.MapFrom(s => s.User.FullName))
            .ForMember(d => d.UserEmail, opt => opt.MapFrom(s => s.User.Email));

        CreateMap<User, AdminUserDto>()
            .ForMember(d => d.AgencyName, opt => opt.MapFrom(s => s.Agency != null ? s.Agency.Name : null));

        CreateMap<ContactMessage, ContactMessageDto>();
    }
}
