name := "Sentiment Project"

version := "1.0"

scalaVersion := "2.10.4"

val sparkVersion = "1.5.0"

libraryDependencies += "org.apache.spark" %% "spark-core" % sparkVersion % "provided"

libraryDependencies += "org.apache.spark" %% "spark-mllib" % sparkVersion % "provided"

libraryDependencies += "org.apache.lucene" % "lucene-core" % "5.3.0"

libraryDependencies += "org.apache.lucene" % "lucene-analyzers-common" % "5.3.0"

libraryDependencies += "com.databricks" % "spark-csv_2.10" % "1.2.0"

assemblyJarName in assembly := "sentiment-project_2.10-assembly-1.0.jar"
