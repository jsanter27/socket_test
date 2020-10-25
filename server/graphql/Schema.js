const GraphQL = require('graphql');
const GraphQLSchema = GraphQL.GraphQLSchema;
const GraphQLObjectType = GraphQL.GraphQLObjectType;
const GraphQLNonNull = GraphQL.GraphQLNonNull;
const GraphQLList = GraphQL.GraphQLList;
const GraphQLID = GraphQL.GraphQLID;
const GraphQLString = GraphQL.GraphQLString;
const User = require('../models/User');
const Video = require('../models/Video');

const UserType = new GraphQLObjectType({
    name: "UserType",
    fields: () => ({
        _id: {
            type: GraphQLID
        },
        googleID: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        },
        videos: {
            type: GraphQLList(GraphQLString)
        }
    })
});

const VideoType = new GraphQLObjectType({
    name: "VideoType",
    fields: () => ({
        _id: {
            type: GraphQLID
        },
        url: {
            type: GraphQLString
        }
    })
});

const QueryType = new GraphQLObjectType({
    name: "Query",
    fields: () => ({
        getUsers: {
            type: new GraphQLList(UserType),
            resolve: () => (
                User.find((err, users) => {
                    if (err)
                        throw new Error(err);
                    if (!users)
                        return null;
                    return users;
                })
            )
        },
        getVideos: {
            type: new GraphQLList(VideoType),
            resolve: () => (
                Video.find((err, videos) => {
                    if (err)
                        throw new Error(err);
                    if (!videos)
                        return null;
                    return videos;
                })
            )
        },
        getUserVideos: {
            type: new GraphQLList(VideoType),
            args: {
                userID : {
                    name: 'userID',
                    type: new GraphQLNonNull(GraphQLID)
                }
            },
            resolve: (root, params) => (
                User.findById(params.userID).populate('videos').exec( (err, videos) => {
                    if (err)
                        throw new Error(err)
                    if (!videos)
                        return null;
                    return videos;
                })
            )
        }
    })
});

const MutationType = new GraphQLObjectType({
    name: "Mutation",
    fields: () => ({
        addVideo: {
            type: VideoType,
            args: {
                userID: {
                    name: 'userID',
                    type: new GraphQLNonNull(GraphQLID)
                },
                url: {
                    name: 'url',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (root, params) => (
                User.findById(params.userID, (err, user) => {
                    if (err)
                        throw new Error(err)
                    if (!user)
                        return null;
                    let oldVideos = user.videos;
                    return new Video({ url: params.url }).save( (err, video) => {
                        if (err)
                            throw new Error(err);
                        if (!video)
                            return null;
                        let newVideos = oldVideos.push(video._id);
                        return user.update({ videos: newVideos }, (err, user) => {
                            if (err)
                                throw new Error();
                            if (!user)
                                return null;
                            return user;
                        });                    
                    });
                })
            )
        },
        removeVideo: {
            type: VideoType,
            args: {
                userID: {
                    name: 'userID',
                    type: new GraphQLNonNull(GraphQLID)
                },
                url: {
                    name: 'url',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (root, params) => (
                User.findById(params.userID, (err, user) => {
                    if (err)
                        throw new Error(err)
                    if (!user)
                        return null;
                    let oldVideos = user.videos;
                    return Video.findOneAndDelete({ url: params.url }, (err, video) => {
                        if (err)
                            throw new Error(err);
                        if (!video)
                            return null;
                        let newVideos = oldVideos.splice(oldVideos.indexOf(params.url));
                        return user.update({ videos: newVideos }, (err, user) => {
                            if (err)
                                throw new Error();
                            if (!user)
                                return null;
                            return user;
                        });                    
                    });
                })
            )
        }
    })
});

module.exports = new GraphQLSchema({ query: QueryType, mutation: MutationType });