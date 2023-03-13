const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const app = express();

//In GraphQL verything is actually strongly typed, "GraphQLObjectType" lets us to create a dynamic object with other types
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");

//graphql uses this schema to know which data to access based on the query we put it

const developers = [
  { id: 1, name: "John" },
  { id: 2, name: "Jonas" },
  { id: 3, name: "Jack" },
];

const projects = [
  { id: 1, name: "mango", developerId: 1 },
  { id: 2, name: "LandY", developerId: 2 },
  { id: 3, name: "ApnaBazaar", developerId: 3 },
  { id: 4, name: "WooCommerce1", developerId: 1 },
  { id: 5, name: "Delicious", developerId: 2 },
  { id: 6, name: "ParInd", developerId: 3 },
  { id: 7, name: "WooCommerce2", developerId: 1 },
];

const DeveloperType = new GraphQLObjectType({
  name: "Developer",
  description: "This represents a developer",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    projects: {
      type: new GraphQLList(ProjectType),
      resolve: (developer) => {
        return projects.filter(
          (project) => project.developerId === developer.id
        );
      },
    },
  }),
});

const ProjectType = new GraphQLObjectType({
  name: "Project",
  description: "This represents a project developed by a developer",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    developerId: { type: GraphQLNonNull(GraphQLInt) },
    developer: {
      type: DeveloperType,
      resolve: (project) => {
        return developers.find(
          (developer) => developer.id === project.developerId
        );
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    project: {
      type: ProjectType,
      description: "A Single Projects",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        projects.find((project) => project.id === args.id),
    },
    projects: {
      type: new GraphQLList(ProjectType),
      description: "List of All Projects",
      resolve: () => projects,
    },
    developer: {
      type: DeveloperType,
      description: "A single Developer",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        developers.find((developer) => developer.id === args.id),
    },
    developers: {
      type: new GraphQLList(DeveloperType),
      description: "List of All Developers",
      resolve: () => developers,
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "mutation",
  description: "Root Mutation",
  fields: () => ({
    addProject: {
      type: ProjectType,
      description: "Add a project",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        developerID: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const project = {
          id: projects.length + 1,
          name: args.name,
          developerId: args.developerId,
        };
        projects.push(project);
        return project;
      },
    },
    addDeveloper: {
      type: DeveloperType,
      description: "Add a developer",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const developer = {
          id: developers.length + 1,
          name: args.name,
        };
        developers.push(developer);
        return developer;
      },
    },
  }),
});

//creating a dummy schema
// const schema = new GraphQLSchema({
//   // inside the "query" section, we define all of the different use cases that we can use for querying
//   query: new GraphQLObjectType({
//     name: "HelloWorld",
//     // in this case we have a single object "HelloWorld"
//     // fields that HelloWorld returns
//     // fields return all of the different sections of the object that we can query data from,
//     // in this case a single field "messgae"
//     fields: () => ({
//       // we are returning an object, that has a message, "message" is an object that defines the type of our message,
//       // also we tell graphQL where to get the message form using "resolve()" {in our case we give a static message "Hello World"}
//       // the resolve function comes with a set of arguments, such as the parent that this is called from and then the other arguments that are passed on to it.
//       message: { type: GraphQLString, resolve: () => "Hello World" },
//     }),
//   }),
// });

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

//creating route (adding a route for our application)
app.use("/graphql", graphqlHTTP({ schema: schema, graphiql: true })); //graphiql gets us a ui to access our graphql server, without having to manually call it (like we do in postman)

app.listen(5000, () => {
  console.log("server is running");
});
