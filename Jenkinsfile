pipeline {
  options { disableConcurrentBuilds() }
  agent {
    docker {
      image 'node'
      args '-v /home/sn0wcat/mc:/.mc'
    }
  }
  stages {
    stage('Prepare') {
      steps {
        lock ('.mc-folder') {
          sh '''
          pwd
          mkdir .mc
          cp -a /.mc/. .mc/
          mkdir ~/.mc
          cp .mc/auth.json ~/.mc/
          mv .mc/private.key .
          '''
        }
      }
    }
    stage('Build') {
      steps {
        sh 'npm install'
      }
    }
    stage('Test') {
      steps {
        sh 'npm run test-jenkins'
      }
    }
    stage('License') {
      steps {
        lock ('license-txt') {
          sh 'npm run license > license-checker.txt'
          sh 'npm run license:summary >> license-checker.txt'
        }
      }
    }
    stage('Package') {
      steps {
        lock ('package') {
          sh '''
          npm pack --unsafe-perm
          '''
        }
      }
    }
    stage('Archive Artifacts') {
      steps {
        archiveArtifacts '*.tgz'
        archiveArtifacts 'license-checker.txt'
      }
    }
  }
  environment {
    CI = 'true'
  }
  post {
    always {
      junit '**/*.xml'
    }
  }
}