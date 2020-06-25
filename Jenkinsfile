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
    stage('Test-CLI') {
      steps {
        sh '''
        dirname=`date +%s`
        mkdir $dirname
        cd $dirname
        alias mc='node ../src/cli/mc'
        set -e
        export MDSP_PASSKEY=passkey.4.unit.test
        mc create-agent --config agent.unittest.json
        mc onboard --config agent.unittest.json
        mc atk --config agent.unittest.json
        mc configure-agent --config agent.unittest.json --assetid 6177d9e13a4c4ab0a3b2d647ba3ba2a7
        mc configure-agent --config agent.unittest.json --mode test
        filename=`date +%s`
        cp agent.unittest.json $filename
        mc upload-file --config agent.unittest.json --file $filename
        mc upload-file --file $filename --assetid 6177d9e13a4c4ab0a3b2d647ba3ba2a7
        mc create-event --assetid 6177d9e13a4c4ab0a3b2d647ba3ba2a7
        mc register-diagnostic --config agent.unittest.json
        mc configure-agent --config agent.unittest.json --mode test
        mc get-diagnostic --config agent.unittest.json
        mc unregister-diagnostic --config agent.unittest.json
        mc offboard-agent --config agent.unittest.json
        mc delete-asset  --assetid `node -pe 'JSON.parse(process.argv[1]).content.clientId' "$(cat agent.unittest.json)"` 
        mc list-assets 
        mc list-files --assetid 6177d9e13a4c4ab0a3b2d647ba3ba2a7
        mc starter-ts
        mc starter-js
        mc download-file --file $filename --assetid 6177d9e13a4c4ab0a3b2d647ba3ba2a7
        mc delete-file --file $filename --assetid 6177d9e13a4c4ab0a3b2d647ba3ba2a7
        mc iam --mode list --group
        cd ..
        rm -rf $dirname
        '''
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
          rm -rf dist
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