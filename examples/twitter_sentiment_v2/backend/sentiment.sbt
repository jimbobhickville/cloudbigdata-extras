name := "Sentiment Project"

version := "1.0"

scalaVersion := "2.10.4"

val sparkVersion = "1.5.0"


libraryDependencies += "org.apache.spark" %% "spark-core" % sparkVersion

libraryDependencies += "org.apache.spark" %% "spark-mllib" % sparkVersion

libraryDependencies += "org.apache.lucene" % "lucene-core" % "5.3.0"

libraryDependencies += "org.apache.lucene" % "lucene-analyzers-common" % "5.3.0"

