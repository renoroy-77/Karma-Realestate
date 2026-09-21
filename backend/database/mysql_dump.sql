-- MySQL dump 10.13  Distrib 26.7.0, for macos26.6 (arm64)
--
-- Host: localhost    Database: karma_realestate
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'dfa91802-b581-11f1-92f7-a1393a76a2cb:1-180';

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'KARMA Admin Team','admin@karmarealestate.in','$2y$12$/5gJ1ipDcJS9vAXkkn5aBeIzl1wpOnokbUdkb2k.zRr/Il/TrkUUO','super_admin',1,NULL,'2026-09-21 00:31:49','2026-09-21 00:31:49');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `confidential_documents`
--

DROP TABLE IF EXISTS `confidential_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `confidential_documents` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doc_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stored_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size_bytes` bigint unsigned NOT NULL,
  `is_watermarked` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `confidential_documents_property_id_index` (`property_id`),
  CONSTRAINT `confidential_documents_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `confidential_documents`
--

LOCK TABLES `confidential_documents` WRITE;
/*!40000 ALTER TABLE `confidential_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `confidential_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_access_logs`
--

DROP TABLE IF EXISTS `document_access_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_access_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `document_id` bigint unsigned NOT NULL,
  `admin_user_id` bigint unsigned DEFAULT NULL,
  `action` enum('uploaded','viewed','downloaded','deleted') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `document_access_logs_admin_user_id_foreign` (`admin_user_id`),
  KEY `document_access_logs_document_id_action_index` (`document_id`,`action`),
  KEY `document_access_logs_created_at_index` (`created_at`),
  CONSTRAINT `document_access_logs_admin_user_id_foreign` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `document_access_logs_document_id_foreign` FOREIGN KEY (`document_id`) REFERENCES `confidential_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_access_logs`
--

LOCK TABLES `document_access_logs` WRITE;
/*!40000 ALTER TABLE `document_access_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `document_access_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `internal_remarks`
--

DROP TABLE IF EXISTS `internal_remarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internal_remarks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint unsigned NOT NULL,
  `remark` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `internal_remarks_property_id_unique` (`property_id`),
  CONSTRAINT `internal_remarks_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `internal_remarks`
--

LOCK TABLES `internal_remarks` WRITE;
/*!40000 ALTER TABLE `internal_remarks` DISABLE KEYS */;
INSERT INTO `internal_remarks` VALUES (1,1,'Owner resides in Dubai. Wants token advance of 15% before initiating sale agreement. Valuation is solid; adjacent property recently traded at 8.2 Lakhs/cent.','2026-09-21 00:31:49','2026-09-21 00:31:49'),(2,2,'Title verified by Adv. Sreedharan. No encumbrances. Owner open to joint development with reputable builder.','2026-09-21 00:31:49','2026-09-21 00:31:49'),(3,3,'Client relocated to Bangalore. Price can be negotiated down to ₹1.12 Cr for an all-cash settlement within 30 days.','2026-09-21 00:31:49','2026-09-21 00:31:49'),(4,4,'Currently being scouted by Blue Dart. If corporate lease is agreed, KARMA brokerage is 1 month rent.','2026-09-21 00:31:49','2026-09-21 00:31:49'),(5,5,'Family trust property; all 4 legal heirs have signed power of attorney authorizing sale through KARMA.','2026-09-21 00:31:49','2026-09-21 00:31:49'),(6,6,'Immediate registration feasible. Clear EC for 30 years obtained.','2026-09-21 00:31:49','2026-09-21 00:31:49'),(7,7,'Rent negotiable to ₹78k for long term 5+ year lease agreement.','2026-09-21 00:31:49','2026-09-21 00:31:49'),(8,8,'Tourist department project underway 1 km away which will appreciate capital value significantly.','2026-09-21 00:31:49','2026-09-21 00:31:49'),(9,9,'Architect owner moving abroad. All furniture can be included for additional ₹12 Lakhs.','2026-09-21 00:31:49','2026-09-21 00:31:49'),(10,10,'High profile seller. Strict non-disclosure requested before in-person site visit.','2026-09-21 00:31:49','2026-09-21 00:31:49');
/*!40000 ALTER TABLE `internal_remarks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_activities`
--

DROP TABLE IF EXISTS `lead_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_activities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lead_id` bigint unsigned NOT NULL,
  `admin_user_id` bigint unsigned DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lead_activities_admin_user_id_foreign` (`admin_user_id`),
  KEY `lead_activities_lead_id_created_at_index` (`lead_id`,`created_at`),
  CONSTRAINT `lead_activities_admin_user_id_foreign` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lead_activities_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_activities`
--

LOCK TABLES `lead_activities` WRITE;
/*!40000 ALTER TABLE `lead_activities` DISABLE KEYS */;
INSERT INTO `lead_activities` VALUES (1,1,1,'status_change','new','interested','Initial lead captured and status assigned.','2026-09-16 00:31:49'),(2,2,1,'status_change','new','contacted','Initial lead captured and status assigned.','2026-09-19 00:31:49'),(3,3,1,'status_change','new','new','Initial lead captured and status assigned.','2026-09-16 00:31:49'),(4,4,1,'status_change','new','closed','Initial lead captured and status assigned.','2026-09-17 00:31:49');
/*!40000 ALTER TABLE `lead_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_merges`
--

DROP TABLE IF EXISTS `lead_merges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_merges` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `duplicate_lead_id` bigint unsigned NOT NULL,
  `primary_lead_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lead_merges_primary_lead_id_foreign` (`primary_lead_id`),
  KEY `lead_merges_duplicate_lead_id_index` (`duplicate_lead_id`),
  CONSTRAINT `lead_merges_primary_lead_id_foreign` FOREIGN KEY (`primary_lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_merges`
--

LOCK TABLES `lead_merges` WRITE;
/*!40000 ALTER TABLE `lead_merges` DISABLE KEYS */;
/*!40000 ALTER TABLE `lead_merges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_notes`
--

DROP TABLE IF EXISTS `lead_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_notes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lead_id` bigint unsigned NOT NULL,
  `admin_user_id` bigint unsigned DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lead_notes_admin_user_id_foreign` (`admin_user_id`),
  KEY `lead_notes_lead_id_created_at_index` (`lead_id`,`created_at`),
  CONSTRAINT `lead_notes_admin_user_id_foreign` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lead_notes_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_notes`
--

LOCK TABLES `lead_notes` WRITE;
/*!40000 ALTER TABLE `lead_notes` DISABLE KEYS */;
INSERT INTO `lead_notes` VALUES (1,1,1,'Senior Surgeon at Aster MIMS. Looking for beachfront villa for retirement. Pre-approved loan of ₹2.5 Cr with SBI.','2026-09-21 00:31:49','2026-09-21 00:31:49'),(2,2,1,'NRI investor based in Deira. Interested in logistics warehouse near Kannur Airport.','2026-09-21 00:31:49','2026-09-21 00:31:49'),(3,3,1,'Requested exact coordinates for Pallikkunnu penthouse.','2026-09-21 00:31:49','2026-09-21 00:31:49'),(4,4,1,'Deal closed on commercial lease. Very satisfied with KARMA service.','2026-09-21 00:31:49','2026-09-21 00:31:49');
/*!40000 ALTER TABLE `lead_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_property_views`
--

DROP TABLE IF EXISTS `lead_property_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_property_views` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lead_id` bigint unsigned NOT NULL,
  `property_id` bigint unsigned NOT NULL,
  `view_count` int unsigned NOT NULL DEFAULT '1',
  `first_viewed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_viewed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lead_property_views_lead_id_property_id_unique` (`lead_id`,`property_id`),
  KEY `lead_property_views_property_id_view_count_index` (`property_id`,`view_count`),
  CONSTRAINT `lead_property_views_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lead_property_views_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_property_views`
--

LOCK TABLES `lead_property_views` WRITE;
/*!40000 ALTER TABLE `lead_property_views` DISABLE KEYS */;
INSERT INTO `lead_property_views` VALUES (1,1,1,3,'2026-09-18 00:31:49','2026-09-20 15:31:49'),(2,2,1,3,'2026-09-16 00:31:49','2026-09-20 20:31:49'),(3,3,1,6,'2026-09-18 00:31:49','2026-09-20 12:31:49'),(4,4,1,2,'2026-09-16 00:31:49','2026-09-20 12:31:49');
/*!40000 ALTER TABLE `lead_property_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `locality` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'otp_verify',
  `status` enum('new','contacted','interested','not_interested','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `leads_created_at_index` (`created_at`),
  KEY `leads_status_created_at_index` (`status`,`created_at`),
  KEY `leads_email_index` (`email`),
  KEY `leads_phone_index` (`phone`),
  KEY `leads_source_index` (`source`),
  KEY `leads_status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
INSERT INTO `leads` VALUES (1,'Dr. Rajesh Nambiar','rajesh.nambiar@keralahealth.org','+919447123456','Talap','site_visit','interested',1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(2,'Fahad Al-Qasimi / Mathew Joseph','mathew.gulfinvest@gmail.com','+971501234567','Dubai / Kannur','otp_verify','contacted',1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(3,'Anjali Warrier','anjali.warrier@tcs.com','+919895099887','Pallikkunnu','otp_verify','new',1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(4,'Vinod Kumar K.','vinod.k@malabartextiles.in','+919496055443','Thalassery','manual','closed',1,'2026-09-21 00:31:49','2026-09-21 00:31:49');
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_09_19_100001_create_admin_users_table',1),(5,'2026_09_19_100002_create_properties_table',1),(6,'2026_09_19_100003_create_property_media_table',1),(7,'2026_09_19_100004_create_confidential_documents_table',1),(8,'2026_09_19_100005_create_document_access_logs_table',1),(9,'2026_09_19_100006_create_internal_remarks_table',1),(10,'2026_09_19_100007_create_leads_table',1),(11,'2026_09_19_100008_create_lead_property_views_table',1),(12,'2026_09_19_100009_create_lead_notes_table',1),(13,'2026_09_19_100010_create_otp_verifications_table',1),(14,'2026_09_19_100011_create_site_visit_requests_table',1),(15,'2026_09_19_100012_create_wishlists_table',1),(16,'2026_09_19_100013_create_testimonials_and_contacts_table',1),(17,'2026_09_19_100014_create_lead_activities_table',1),(18,'2026_09_19_100015_create_lead_merges_table',1),(19,'2026_09_20_030951_create_personal_access_tokens_table',1),(20,'2026_09_20_140000_create_site_settings_table',1),(21,'2026_09_20_144500_add_brochure_url_to_properties_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_verifications`
--

DROP TABLE IF EXISTS `otp_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_verifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL DEFAULT '0',
  `locked_until` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `otp_verifications_email_is_verified_expires_at_index` (`email`,`is_verified`,`expires_at`),
  KEY `otp_verifications_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verifications`
--

LOCK TABLES `otp_verifications` WRITE;
/*!40000 ALTER TABLE `otp_verifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purpose` enum('sale','rent','lease') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('land','house','flat','warehouse','commercial') COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `price_basis` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'total',
  `negotiable` tinyint(1) NOT NULL DEFAULT '0',
  `land_area` decimal(10,2) DEFAULT NULL,
  `land_area_unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cent',
  `building_area_sqft` decimal(10,2) DEFAULT NULL,
  `bedrooms` tinyint unsigned DEFAULT NULL,
  `bathrooms` tinyint unsigned DEFAULT NULL,
  `amenities` json DEFAULT NULL,
  `pros` json DEFAULT NULL,
  `cons` json DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `locality` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Kannur',
  `address_line` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `virtual_tour_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brochure_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rera_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `land_classification` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('available','under_negotiation','sold','rented','leased','delisted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `view_count` int unsigned NOT NULL DEFAULT '0',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `owner_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `owner_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `owner_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `owner_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `properties_slug_unique` (`slug`),
  KEY `properties_purpose_type_status_is_published_index` (`purpose`,`type`,`status`,`is_published`),
  KEY `properties_is_featured_is_published_index` (`is_featured`,`is_published`),
  KEY `properties_locality_index` (`locality`),
  KEY `properties_price_index` (`price`),
  KEY `properties_latitude_longitude_index` (`latitude`,`longitude`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (1,'Cliffside Beachfront Estate at Thottada','cliffside-beachfront-estate-thottada','sale','house',32500000.00,'total',1,38.50,'cent',4200.00,5,5,'[\"Private Beach Access\", \"Infinity Pool\", \"Solar Power Backup\", \"Landscaped Courtyard\", \"Borewell & Open Well\"]','[\"Panoramic Arabian Sea view\", \"High tourism / boutique homestay potential\", \"Clear single-owner title deed since 1982\"]','[\"Coastal Regulation Zone (CRZ) constraints for new exterior expansion\", \"12-foot access road requires cautious driving for heavy vehicles\"]','Spectacular seaside luxury estate nestled along the serene cliffs of Thottada beach. Traditional Kerala architecture fused with contemporary Scandinavian interiors. Features double-height living areas and open sit-outs overlooking the ocean.','Thottada','Kannur','House 4/218, Beach Road, Thottada, Kannur 670007',11.8239000,75.4190000,'https://my.matterport.com/show/?m=sample-thottada-estate',NULL,'K-RERA/PRJ/KAN/042/2024','Residential / Garden Land (Purayidam)','available',1,1,342,'Beachfront Luxury Estate for Sale in Thottada, Kannur | KARMA','Spectacular 5BHK seaside luxury estate on 38.5 cents in Thottada with private beach access and infinity pool.','Capt. C. P. Somanathan (Retd.)','+971 50 882 1928','somanathan.c@gmail.com','Settled in Dubai. Primary title deed in SBI Locker, South Bazar. Authorized KARMA for exclusive representation.','2026-09-21 00:31:49','2026-09-21 00:31:49',NULL),(2,'Prime Commercial Corner Plot on NH-66 Talap','prime-commercial-corner-plot-talap','sale','land',45000000.00,'total',0,25.00,'cent',NULL,NULL,NULL,'[\"3-Phase Electricity\", \"Wide Highway Frontage (65 ft)\", \"Water Connection\", \"Tarred Road Frontage\"]','[\"Direct frontage on NH-66 highway expansion\", \"Ideal for diagnostic center, car showroom or corporate bank branch\"]','[\"High upfront capital required\", \"Commercial tax bracket applies\"]','Highly coveted commercial corner land situated at the junction of Talap and the newly widened NH-66 highway. Immediate commercial conversion permit in hand.','Talap','Kannur','Opposite AKG Memorial Hospital, Talap, Kannur 670002',11.8833000,75.3667000,NULL,NULL,NULL,'Commercial (Dry Land / Nanja nilam converted)','available',1,1,580,'25 Cents Commercial Highway Plot in Talap, Kannur | KARMA','Prime commercial land on NH-66 Talap junction with 65ft road frontage. Ready for hospital, showroom or bank.','K. V. Govindan Kutty & Sons','+91 94470 11223','govindankutty@kvgtrust.org','Family business trust. All tax receipts up to 2026 cleared. No legal disputes.','2026-09-21 00:31:49','2026-09-21 00:31:49',NULL),(3,'Skyline View 3BHK Penthouse in Pallikkunnu','skyline-view-3bhk-penthouse-pallikkunnu','sale','flat',11800000.00,'total',1,NULL,'sqft',2350.00,3,3,'[\"Covered Reserved Parking (2 cars)\", \"Clubhouse & Gymnasium\", \"24/7 Security & CCTV\", \"Automatic Generator Backup\", \"Rooftop Party Area\"]','[\"Top-floor unit with unhindered city views\", \"High rental yield (approx ₹38,000/month)\", \"Reputed builder with A-grade occupancy certificate\"]','[\"Monthly maintenance ₹4,500\", \"Pets require association pre-approval\"]','Ultra-spacious penthouse featuring Italian marble flooring, modular German kitchen with built-in appliances, and a private wraparound balcony looking over the lush canopy of Pallikkunnu.','Pallikkunnu','Kannur','Flat 11B, Skyline Oasis, Near Civil Station, Pallikkunnu, Kannur 670004',11.8900000,75.3600000,'https://my.matterport.com/show/?m=sample-skyline-penthouse',NULL,'K-RERA/PRJ/KAN/019/2021','Residential Flat','available',1,1,219,'Luxury 3BHK Penthouse for Sale in Pallikkunnu, Kannur | KARMA','2350 sq.ft penthouse with skyline views, 2 car parking, and Italian marble interiors near Civil Station.','Pradeep Kumar Nair','+91 98450 77665','pradeep.nair@infosys.com','Bangalore tech VP. Wants prompt registration within 45 days.','2026-09-21 00:31:49','2026-09-21 00:31:49',NULL),(4,'Airport Logistics Warehouse & Yard in Mattannur','airport-logistics-warehouse-mattannur','lease','warehouse',220000.00,'per_month',1,60.00,'cent',14000.00,NULL,4,'[\"Container Truck Turning Radius\", \"Insulated PEB Structure\", \"Loading Docks (4 bays)\", \"Heavy-duty Epoxy Flooring\", \"Fire Hydrant System\"]','[\"Only 4.5 km from Kannur International Airport (CNN) cargo gate\", \"Clear 9-meter eave height for vertical racking\", \"Ready for immediate handover\"]','[\"Minimum 3-year lock-in period required\", \"Security deposit equivalent to 6 months rent\"]','State-of-the-art logistics hub built to Grade-A specifications. Ideal for courier hubs, e-commerce fulfillment, cold storage conversion, or pharmaceutical distribution.','Mattannur','Kannur','Plot 8B, KINFRA Industrial Park Link Road, Mattannur 670702',11.9300000,75.5700000,NULL,NULL,NULL,'Industrial / Commercial','available',1,0,145,'14,000 Sq.Ft Warehouse for Lease near Kannur Airport | KARMA','Grade-A logistics warehouse with 4 loading bays and container turning radius just 4.5 km from Kannur Airport.','K. M. Haridas','+91 94473 88990','haridas.logistics@gmail.com','Industrial warehouse owner. Open to 3 to 9 year lease contracts.','2026-09-21 00:31:49','2026-09-21 00:31:49',NULL),(5,'Heritage Nalukettu Villa on 50 Cents in Taliparamba','heritage-nalukettu-villa-taliparamba','sale','house',28000000.00,'total',1,50.00,'cent',3800.00,4,4,'[\"Traditional Nadumuttam (Central Courtyard)\", \"Teakwood Woodwork\", \"Organic Fruit Orchard\", \"Perennial Natural Pond\", \"Outhouse / Servant Quarters\"]','[\"Authentic antique wood carvings and brass fittings\", \"Abundant natural water source even during peak summer\", \"Peaceful, green neighborhood near Rajarajeshwara Temple\"]','[\"Periodic wood polishing maintenance needed\", \"Distance from Kannur city center is 22 km\"]','A restored 75-year-old architectural masterpiece featuring genuine Anjili and Teak timber, traditional copper roof ridge details, and an enchanting central open-to-sky courtyard surrounded by 50 cents of mature coconut, mango, and areca palms.','Taliparamba','Kannur','Trichambaram Road, Near Temple, Taliparamba 670141',12.0400000,75.3500000,NULL,NULL,NULL,'Residential Garden Land','available',1,0,410,'Heritage Nalukettu Villa on 50 Cents in Taliparamba | KARMA','Restored 4BHK traditional Kerala nalukettu home with courtyard, natural pond, and organic orchard.','Dr. K. N. Namboodiri','+91 94460 33445','namboodiri.kn@aims.org','Ayurvedic doctor family. Clear partition deed.','2026-09-21 00:31:49','2026-09-21 00:31:49',NULL),(6,'Gated Community Residential Plot in Chalad','gated-community-residential-plot-chalad','sale','land',6500000.00,'total',0,10.00,'cent',NULL,NULL,NULL,'[\"Compound Wall & Gate\", \"Tarred Internal 20ft Road\", \"Street Lighting\", \"KWA Water Line\"]','[\"Square-shaped plot with excellent vaastu alignment\", \"Walking distance to English medium school and supermarket\"]','[\"Fixed price per cent of ₹6.5 Lakhs\"]','Perfect square plot in an exclusive residential enclave in Chalad. Completely compound-walled with automated entry barrier, lush landscaping, and ready water/electric connections.','Chalad','Kannur','Green Valley Enclave, Near Alavil Bridge, Chalad, Kannur 670014',11.8850000,75.3550000,NULL,NULL,NULL,'Residential (Dry Land)','available',1,0,180,'10 Cents Residential Plot in Chalad, Kannur | KARMA','Gated community square plot with compound wall, tarred road, and KWA water in Chalad.','T. P. Muralidharan','+91 98951 22334','muralidharan.tp@ksebltd.in','Retired KSEB engineer.','2026-09-21 00:31:49','2026-09-21 00:31:49',NULL),(7,'National Highway Commercial Showroom Space in Chovva','national-highway-commercial-showroom-chovva','rent','commercial',85000.00,'per_month',1,NULL,'sqft',1850.00,NULL,2,'[\"Toughened Glass Elevation\", \"Ample Customer Parking\", \"Lift Access\", \"Backup Generator\"]','[\"High footfall area next to railway overbridge\", \"Maximum visibility for retail brands\"]','[\"Heavy peak hour traffic on main road\"]','Ground floor corner showroom with full glass frontage facing the highway. Ready for immediate interior fit-out by lifestyle brands, electronics, or clinics.','Chovva','Kannur','Ground Floor, Royal Plaza, Chovva Junction, Kannur 670006',11.8600000,75.3950000,NULL,NULL,NULL,'Commercial','available',1,0,98,'Ground Floor Commercial Showroom for Rent in Chovva, Kannur','1850 sq.ft prime commercial space with glass frontage and parking on NH Chovva Junction.','Royal Builders Kannur','+91 94471 99001','leasing@royalbuilderskannur.com','Direct developer inventory.','2026-09-21 00:31:49','2026-09-21 00:31:49',NULL),(8,'Coconut Grove Island Plot in Dharmadam','coconut-grove-island-plot-dharmadam','sale','land',16000000.00,'total',1,32.00,'cent',NULL,NULL,NULL,'[\"Riverfront Boundary\", \"Private Boat Jetty Berth\", \"Rich Alluvial Soil\", \"Fenced Perimeter\"]','[\"Picturesque river frontage flowing into Dharmadam island estuary\", \"Superb setting for boutique eco-resort or wellness retreat\"]','[\"Requires embankment retaining wall reinforcement along 40ft river edge\"]','Serene parcel of fertile riverbank land studded with 45 bearing coconut trees. Quiet natural sanctuary with cool breeze year-round.','Dharmadam','Kannur','River View Point, Near Dharmadam Island Walkway 670106',11.7770000,75.4670000,NULL,NULL,NULL,'Agricultural / Garden Land','available',1,0,310,'32 Cents Waterfront Coconut Grove Land in Dharmadam | KARMA','Scenic riverfront land parcel near Dharmadam Island walkway. Ideal for eco-resort or private farm villa.','K. C. Balakrishnan','+91 94472 66778','kcbala@dharmadamfarms.in','Agricultural family estate.','2026-09-21 00:31:49','2026-09-21 00:31:49',NULL),(9,'Contemporary 4BHK Architect Villa in Payyanur','contemporary-4bhk-architect-villa-payyanur','sale','house',17500000.00,'total',1,15.00,'cent',3100.00,4,4,'[\"Home Cinema Room\", \"Smart Home Automation\", \"Solar Rooftop 5kW\", \"EV Charging Point\", \"Designer Kitchen\"]','[\"Brand new construction (2025 completion)\", \"Zero water logging history\", \"Energy positive house with net metering\"]','[\"Price is firm with minor room for negotiation\"]','Sleek cubist design showcasing exposed concrete textures, wooden louvers, and expansive glass panels that bathe the living spaces in natural light.','Payyanur','Kannur','Near Perumba Junction, Payyanur 670307',12.1000000,75.2000000,NULL,NULL,'K-RERA/PRJ/KAN/088/2024','Residential','available',1,0,264,'Architect 4BHK Smart Villa on 15 Cents in Payyanur | KARMA','Modern cubist 4BHK smart home in Payyanur with solar rooftop, EV charger, and cinema room.','Ar. Vipin Chandran','+91 98470 55112','vipin@studioarch.in','Architect moving to Germany.','2026-09-21 00:31:49','2026-09-21 00:31:49',NULL),(10,'Colonial Style Sea-Facing Bungalow in Thalassery','colonial-sea-facing-bungalow-thalassery','sale','house',39000000.00,'total',1,42.00,'cent',4500.00,6,6,'[\"British Era High Ceilings\", \"Granite Paved Driveway\", \"Vintage Terracotta Tiles\", \"Caretaker Cottage\", \"Deep Sea Views\"]','[\"Historic legacy property close to Thalassery Fort and Pier\", \"Huge 42 cents land parcel in heart of town\"]','[\"Heritage conservation guidelines apply on facade alterations\"]','Rare British-colonial era sea-view residence situated high on the Thalassery coastline. Features broad verandahs, ornate arches, and breezy high ceilings.','Thalassery','Kannur','Fort Road, Near Sea View Park, Thalassery 670101',11.7480000,75.4890000,NULL,NULL,NULL,'Residential Purayidam','available',1,0,520,'Historic British Colonial Sea-Facing Bungalow in Thalassery | KARMA','Rare 6BHK sea-view heritage residence on 42 cents near Thalassery Fort with deep ocean panoramas.','Kuruvilla Thomas Family','+91 94470 88123','kuruvilla.thomas@heritagekerala.com','Prominent heritage family. Requires NDA before physical inspection.','2026-09-21 00:31:49','2026-09-21 00:31:49',NULL);
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_media`
--

DROP TABLE IF EXISTS `property_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_media` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint unsigned NOT NULL,
  `media_type` enum('photo','video','virtual_tour') COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumb_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medium_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_cover` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `property_media_property_id_sort_order_index` (`property_id`,`sort_order`),
  CONSTRAINT `property_media_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_media`
--

LOCK TABLES `property_media` WRITE;
/*!40000 ALTER TABLE `property_media` DISABLE KEYS */;
INSERT INTO `property_media` VALUES (1,1,'photo',NULL,'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',NULL,1,0,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(2,1,'photo',NULL,'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',NULL,0,1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(3,1,'photo',NULL,'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',NULL,0,2,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(4,1,'photo',NULL,'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',NULL,0,3,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(5,1,'photo',NULL,'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',NULL,0,4,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(6,2,'photo',NULL,'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',NULL,1,0,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(7,2,'photo',NULL,'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80',NULL,0,1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(8,2,'photo',NULL,'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',NULL,0,2,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(9,3,'photo',NULL,'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',NULL,1,0,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(10,3,'photo',NULL,'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',NULL,0,1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(11,3,'photo',NULL,'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',NULL,0,2,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(12,3,'photo',NULL,'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',NULL,0,3,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(13,4,'photo',NULL,'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',NULL,1,0,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(14,4,'photo',NULL,'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',NULL,0,1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(15,4,'photo',NULL,'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',NULL,0,2,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(16,4,'photo',NULL,'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',NULL,0,3,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(17,5,'photo',NULL,'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',NULL,1,0,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(18,5,'photo',NULL,'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',NULL,0,1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(19,5,'photo',NULL,'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',NULL,0,2,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(20,5,'photo',NULL,'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',NULL,0,3,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(21,6,'photo',NULL,'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',NULL,1,0,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(22,6,'photo',NULL,'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',NULL,0,1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(23,7,'photo',NULL,'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',NULL,1,0,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(24,7,'photo',NULL,'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',NULL,0,1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(25,7,'photo',NULL,'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',NULL,0,2,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(26,8,'photo',NULL,'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',NULL,1,0,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(27,8,'photo',NULL,'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',NULL,0,1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(28,9,'photo',NULL,'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',NULL,1,0,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(29,9,'photo',NULL,'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',NULL,0,1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(30,9,'photo',NULL,'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',NULL,0,2,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(31,10,'photo',NULL,'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',NULL,1,0,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(32,10,'photo',NULL,'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80',NULL,0,1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(33,10,'photo',NULL,'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',NULL,0,2,'2026-09-21 00:31:49','2026-09-21 00:31:49');
/*!40000 ALTER TABLE `property_media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` longtext COLLATE utf8mb4_unicode_ci,
  `group` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_visit_requests`
--

DROP TABLE IF EXISTS `site_visit_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_visit_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint unsigned NOT NULL,
  `lead_id` bigint unsigned DEFAULT NULL,
  `visitor_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `visitor_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `visitor_phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferred_date` date NOT NULL,
  `preferred_time_slot` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_status` enum('pending','confirmed','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `site_visit_requests_lead_id_foreign` (`lead_id`),
  KEY `site_visit_requests_property_id_booking_status_index` (`property_id`,`booking_status`),
  KEY `site_visit_requests_preferred_date_booking_status_index` (`preferred_date`,`booking_status`),
  CONSTRAINT `site_visit_requests_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL,
  CONSTRAINT `site_visit_requests_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_visit_requests`
--

LOCK TABLES `site_visit_requests` WRITE;
/*!40000 ALTER TABLE `site_visit_requests` DISABLE KEYS */;
INSERT INTO `site_visit_requests` VALUES (1,2,1,'Dr. Rajesh Nambiar','rajesh.nambiar@keralahealth.org','+919447123456','2026-09-24','morning','confirmed','Customer requested site agent to bring title deed copies.','2026-09-21 00:31:49','2026-09-21 00:31:49');
/*!40000 ALTER TABLE `site_visit_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonials` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` tinyint unsigned NOT NULL DEFAULT '5',
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES (1,'Dr. K. Radhakrishnan','Cardiologist, Kannur Medical College','KARMA handled our Talap commercial clinic purchase with utmost transparency. The document verification and title clearance were done in less than 48 hours.',5,NULL,1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(2,'Faisal Mohammed','NRI Business Owner, Abu Dhabi','Finding sea-view luxury land in Kannur while living in the UAE was effortless with KARMA. The OTP-unlocked details and drone video gave me complete confidence to book before flying down.',5,NULL,1,'2026-09-21 00:31:49','2026-09-21 00:31:49'),(3,'Adv. Meenakshi Menon','High Court Advocate','As a legal practitioner, I was thoroughly impressed by KARMA’s confidential document vault and encumbrance tracking. Absolutely professional service.',5,NULL,1,'2026-09-21 00:31:49','2026-09-21 00:31:49');
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lead_id` bigint unsigned NOT NULL,
  `property_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlists_lead_id_property_id_unique` (`lead_id`,`property_id`),
  KEY `wishlists_property_id_foreign` (`property_id`),
  CONSTRAINT `wishlists_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlists_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-21 11:32:06
