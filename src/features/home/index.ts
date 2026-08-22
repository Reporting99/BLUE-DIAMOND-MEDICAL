/**
 * Homepage composition. The route file under src/app owns only params,
 * metadata and section layout; the copy, the showcase selection and the card
 * components live here.
 */
export { homepageCopy } from "./copy";
export { concernForTreatment, getHomeShowcases, homeFaqSchemaEntries } from "./queries";
export { ServiceCard } from "./components/ServiceCard";
export { StatsCounters } from "./components/StatsCounters";
export { TechnologyCard } from "./components/TechnologyCard";
export { TreatmentCard } from "./components/TreatmentCard";
